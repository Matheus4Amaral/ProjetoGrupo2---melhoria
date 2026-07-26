import pool from '../config/database.js'
import jwt from 'jsonwebtoken'

export const getDashboardData = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token não fornecido ou mal formatado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id_usuario = decoded.id_usuario;

    const totalProductsStock = await pool.query(
      `SELECT COALESCE(SUM(pe.quantidade_estoque_atual), 0) AS total
       FROM public.possui_estoque pe
       JOIN public.estoque e ON e.id_estoque = pe.id_estoque
       WHERE e.id_usuario = $1`,
      [id_usuario]
    );

    const totalSales = await pool.query(
      `SELECT COALESCE(SUM(pv.quantidade_venda), 0) AS total
       FROM public.possui_venda pv
       JOIN public.venda v ON v.id_venda = pv.id_venda
       WHERE v.id_usuario = $1`,
      [id_usuario]
    );

    const totalSuppliers = await pool.query(
      `SELECT COUNT(*) AS total
       FROM public.fornecedor
       WHERE id_usuario = $1`,
      [id_usuario]
    );

    const lowStock = await pool.query(
      `SELECT
          p.id_produto,
          p.nome_produto,
          e.id_estoque,
          pe.quantidade_estoque_total,
          pe.quantidade_estoque_atual,
          CASE
            WHEN pe.quantidade_estoque_atual <= pe.quantidade_estoque_total * 0.25 THEN 'Crítico'
            WHEN pe.quantidade_estoque_atual > pe.quantidade_estoque_total * 0.25
              AND pe.quantidade_estoque_atual <= pe.quantidade_estoque_total * 0.5 THEN 'Alerta'
            ELSE 'Normal'
          END AS status
       FROM public.produto p
       JOIN public.possui_estoque pe ON pe.id_produto = p.id_produto
       JOIN public.estoque e ON e.id_estoque = pe.id_estoque
       WHERE e.id_usuario = $1
         AND pe.quantidade_estoque_atual <= pe.quantidade_estoque_total * 0.5
       ORDER BY pe.quantidade_estoque_atual ASC
       LIMIT 5`,
      [id_usuario]
    );

    const salesEvolution = await pool.query(
      `WITH dias AS (
          SELECT generate_series(
            current_date - interval '6 days',
            current_date,
            interval '1 day'
          )::date AS dia
        )
        SELECT
          dias.dia,
          COALESCE(SUM(pv.quantidade_venda), 0) AS total_vendas,
          COALESCE(SUM(v.valor_venda), 0) AS valor_total
        FROM dias
        LEFT JOIN public.venda v
          ON v.data_venda::date = dias.dia
          AND v.id_usuario = $1
        LEFT JOIN public.possui_venda pv
          ON pv.id_venda = v.id_venda
        GROUP BY dias.dia
        ORDER BY dias.dia`,
      [id_usuario]
    );

    const recentProducts = await pool.query(
      `SELECT COUNT(*) AS total
       FROM public.produto
       WHERE id_usuario = $1
         AND data_cadastro >= current_date - interval '6 days'`,
      [id_usuario]
    );

    const recentSales = await pool.query(
      `SELECT COUNT(*) AS total
       FROM public.venda
       WHERE id_usuario = $1
         AND data_venda >= current_date - interval '6 days'`,
      [id_usuario]
    );

    const recentSuppliers = await pool.query(
      `SELECT COUNT(*) AS total
       FROM public.fornecedor
       WHERE id_usuario = $1
         AND data_cadastro >= current_date - interval '6 days'`,
      [id_usuario]
    );

    return res.status(200).json({
      totalProductsStock: totalProductsStock.rows[0].total,
      totalSales: totalSales.rows[0].total,
      totalSuppliers: totalSuppliers.rows[0].total,
      lowStock: lowStock.rows,
      salesEvolution: salesEvolution.rows,
      recentProducts: recentProducts.rows[0].total,
      recentSales: recentSales.rows[0].total,
      recentSuppliers: recentSuppliers.rows[0].total
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar dados do dashboard',
      error: error.message
    });
  }
};

export const replacement = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token não fornecido ou mal formatado" });
  }

  const token = authHeader.split(" ")[1];
  const { id_produto, id_estoque, quantidade_reposicao } = req.body;

  if (id_produto == null || id_estoque == null || quantidade_reposicao == null) {
    return res.status(400).json({ message: 'Dados inexistentes' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id_usuario = decoded.id_usuario;

    const result = await pool.query(
      `UPDATE public.possui_estoque pe
       SET quantidade_estoque_atual = pe.quantidade_estoque_atual + $1
       FROM public.estoque e
       WHERE pe.id_produto = $2
         AND pe.id_estoque = $3
         AND e.id_estoque = pe.id_estoque
         AND e.id_usuario = $4
       RETURNING pe.*`,
      [quantidade_reposicao, id_produto, id_estoque, id_usuario]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Relação produto/estoque não encontrada para este usuário" });
    }

    return res.status(200).json({
      message: "Reposição realizada com sucesso",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao realizar reposição",
      error: error.message
    });
  }
};