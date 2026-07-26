import pool from '../config/database.js';
import jwt from 'jsonwebtoken';

const getUserFromToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token não fornecido ou mal formatado');
  }

  const token = authHeader.split(' ')[1];
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const createStock = async (req, res) => {
  const { descricao } = req.body;

  if (!descricao || descricao.trim() === '') {
    return res.status(400).json({ message: 'Descrição é obrigatória' });
  }

  try {
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    const result = await pool.query(
      `INSERT INTO public.estoque (descricao, id_usuario)
       VALUES ($1, $2)
       RETURNING *`,
      [descricao, id_usuario]
    );

    return res.status(201).json({
      message: 'Estoque criado com sucesso',
      estoque: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao criar estoque',
      error: error.message
    });
  }
};

export const getStock = async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    const result = await pool.query(
      `SELECT *
       FROM public.estoque
       WHERE id_usuario = $1
       ORDER BY id_estoque ASC`,
      [id_usuario]
    );

    return res.status(200).json({
      message: 'Estoques listados com sucesso',
      estoques: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao listar estoques',
      error: error.message
    });
  }
};

export const getStockByNome = async (req, res) => {
  try {
    const { nome } = req.params;
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    const result = await pool.query(
      `SELECT *
       FROM public.estoque
       WHERE id_usuario = $1
         AND descricao ILIKE $2`,
      [id_usuario, `%${nome}%`]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Nenhum estoque encontrado com esse nome' });
    }

    return res.status(200).json({
      message: 'Estoque(s) encontrado(s) com sucesso',
      estoques: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar estoque',
      error: error.message
    });
  }
};

export const getStockByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    let condicao = '';

    if (status === 'critico') {
      condicao = 'COUNT(pe.id_produto) < 5';
    } else if (status === 'alerta') {
      condicao = 'COUNT(pe.id_produto) >= 5 AND COUNT(pe.id_produto) < 10';
    } else if (status === 'regular') {
      condicao = 'COUNT(pe.id_produto) >= 10';
    } else {
      return res.status(400).json({
        message: 'Status inválido. Use: critico, alerta ou regular'
      });
    }

    const result = await pool.query(
      `SELECT
         e.id_estoque,
         e.descricao,
         e.id_usuario,
         COUNT(pe.id_produto) AS total_produtos,
         CASE
           WHEN COUNT(pe.id_produto) < 5 THEN 'critico'
           WHEN COUNT(pe.id_produto) >= 5 AND COUNT(pe.id_produto) < 10 THEN 'alerta'
           ELSE 'regular'
         END AS status
       FROM public.estoque e
       LEFT JOIN public.possui_estoque pe ON e.id_estoque = pe.id_estoque
       WHERE e.id_usuario = $1
       GROUP BY e.id_estoque, e.descricao, e.id_usuario
       HAVING ${condicao}
       ORDER BY total_produtos ASC`,
      [id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: `Nenhum estoque com status ${status} encontrado`
      });
    }

    return res.status(200).json({
      message: `Estoques com status ${status}`,
      total: result.rows.length,
      estoques: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar estoques por status',
      error: error.message
    });
  }
};

export const getStockById = async (req, res) => {
  try {
    const { id } = req.params;
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    const result = await pool.query(
      `SELECT *
       FROM public.estoque
       WHERE id_estoque = $1 AND id_usuario = $2`,
      [id, id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Estoque não encontrado' });
    }

    return res.status(200).json({
      message: 'Estoque encontrado com sucesso',
      estoque: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar estoque',
      error: error.message
    });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao } = req.body;
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    if (!descricao) {
      return res.status(400).json({ message: 'Informe ao menos um campo para atualizar' });
    }

    const checkStock = await pool.query(
      `SELECT *
       FROM public.estoque
       WHERE id_estoque = $1 AND id_usuario = $2`,
      [id, id_usuario]
    );

    if (checkStock.rows.length === 0) {
      return res.status(404).json({ message: 'Estoque não encontrado' });
    }

    const estoqueAtual = checkStock.rows[0];
    const novaDescricao = descricao !== undefined ? descricao : estoqueAtual.descricao;

    const result = await pool.query(
      `UPDATE public.estoque
       SET descricao = $1
       WHERE id_estoque = $2 AND id_usuario = $3
       RETURNING *`,
      [novaDescricao, id, id_usuario]
    );

    return res.status(200).json({
      message: 'Estoque atualizado com sucesso',
      estoque: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao atualizar estoque',
      error: error.message
    });
  }
};

export const getStockProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    const result = await pool.query(
      `SELECT
         p.id_produto,
         p.nome_produto,
         p.categoria,
         p.descricao,
         p.peso,
         p.volume,
         p.lote,
         p.preco_compra,
         p.preco_venda,
         p.id_fornecedor,
         f.nome_fornecedor,
         pe.quantidade_estoque_total,
         pe.quantidade_estoque_atual,
         CASE
           WHEN pe.quantidade_estoque_atual <= pe.quantidade_estoque_total * 0.25 THEN 'Crítico'
           WHEN pe.quantidade_estoque_atual <= pe.quantidade_estoque_total * 0.5 THEN 'Alerta'
           ELSE 'Regular'
         END AS status
       FROM public.possui_estoque pe
       INNER JOIN public.produto p
         ON pe.id_produto = p.id_produto
       INNER JOIN public.estoque e
         ON e.id_estoque = pe.id_estoque
       LEFT JOIN public.fornecedor f
         ON p.id_fornecedor = f.id_fornecedor
       WHERE pe.id_estoque = $1
         AND e.id_usuario = $2
       ORDER BY p.nome_produto`,
      [id, id_usuario]
    );

    return res.status(200).json({
      message: 'Produtos do estoque listados com sucesso',
      total: result.rows.length,
      produtos: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar produtos do estoque',
      error: error.message
    });
  }
};

export const addProductToStock = async (req, res) => {
  try {
    const { id_estoque } = req.params;
    const { id_produto, quantidade_estoque_total, quantidade_estoque_atual } = req.body;
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    if (!id_produto || quantidade_estoque_total === undefined || quantidade_estoque_atual === undefined) {
      return res.status(400).json({
        message: 'id_produto, quantidade_estoque_total e quantidade_estoque_atual são obrigatórios'
      });
    }

    if (quantidade_estoque_total < 0 || quantidade_estoque_atual < 0) {
      return res.status(400).json({ message: 'Quantidades não podem ser negativas' });
    }

    const estoqueExiste = await pool.query(
      `SELECT *
       FROM public.estoque
       WHERE id_estoque = $1 AND id_usuario = $2`,
      [id_estoque, id_usuario]
    );

    if (estoqueExiste.rows.length === 0) {
      return res.status(404).json({ message: 'Estoque não encontrado para este usuário' });
    }

    const checkProduct = await pool.query(
      `SELECT *
       FROM public.possui_estoque
       WHERE id_estoque = $1 AND id_produto = $2`,
      [id_estoque, id_produto]
    );

    if (checkProduct.rows.length > 0) {
      return res.status(400).json({ message: 'Produto já existe neste estoque' });
    }

    await pool.query(
      `INSERT INTO public.possui_estoque
       (id_estoque, id_produto, quantidade_estoque_total, quantidade_estoque_atual)
       VALUES ($1, $2, $3, $4)`,
      [id_estoque, id_produto, quantidade_estoque_total, quantidade_estoque_atual]
    );

    return res.status(201).json({ message: 'Produto adicionado ao estoque com sucesso' });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao adicionar produto ao estoque',
      error: error.message
    });
  }
};

export const updateProductInStock = async (req, res) => {
  try {
    const { id_estoque, id_produto } = req.params;
    const { quantidade_estoque_total, quantidade_estoque_atual } = req.body;
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    if (quantidade_estoque_total === undefined && quantidade_estoque_atual === undefined) {
      return res.status(400).json({ message: 'Informe ao menos um campo para atualizar' });
    }

    if (
      (quantidade_estoque_total !== undefined && quantidade_estoque_total < 0) ||
      (quantidade_estoque_atual !== undefined && quantidade_estoque_atual < 0)
    ) {
      return res.status(400).json({ message: 'Quantidades não podem ser negativas' });
    }

    const checkProduct = await pool.query(
      `SELECT pe.*
       FROM public.possui_estoque pe
       INNER JOIN public.estoque e ON e.id_estoque = pe.id_estoque
       WHERE pe.id_estoque = $1
         AND pe.id_produto = $2
         AND e.id_usuario = $3`,
      [id_estoque, id_produto, id_usuario]
    );

    if (checkProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado neste estoque' });
    }

    const produtoAtual = checkProduct.rows[0];
    const novaQuantidadeTotal = quantidade_estoque_total !== undefined ? quantidade_estoque_total : produtoAtual.quantidade_estoque_total;
    const novaQuantidadeAtual = quantidade_estoque_atual !== undefined ? quantidade_estoque_atual : produtoAtual.quantidade_estoque_atual;

    const result = await pool.query(
      `UPDATE public.possui_estoque
       SET quantidade_estoque_total = $1,
           quantidade_estoque_atual = $2
       WHERE id_estoque = $3 AND id_produto = $4
       RETURNING *`,
      [novaQuantidadeTotal, novaQuantidadeAtual, id_estoque, id_produto]
    );

    return res.status(200).json({
      message: 'Quantidade atualizada com sucesso',
      produto: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao atualizar produto no estoque',
      error: error.message
    });
  }
};

export const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    const result = await pool.query(
      `DELETE FROM public.estoque
       WHERE id_estoque = $1 AND id_usuario = $2
       RETURNING *`,
      [id, id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Estoque não encontrado' });
    }

    return res.status(200).json({
      message: 'Estoque excluído com sucesso',
      estoque_excluido: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao excluir estoque',
      error: error.message
    });
  }
};

export const removeProductFromStock = async (req, res) => {
  try {
    const { id_estoque, id_produto } = req.params;
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    const checkOwnership = await pool.query(
      `SELECT pe.*
       FROM public.possui_estoque pe
       INNER JOIN public.estoque e ON e.id_estoque = pe.id_estoque
       WHERE pe.id_estoque = $1
         AND pe.id_produto = $2
         AND e.id_usuario = $3`,
      [id_estoque, id_produto, id_usuario]
    );

    if (checkOwnership.rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado neste estoque' });
    }

    await pool.query(
      `DELETE FROM public.possui_estoque
       WHERE id_estoque = $1 AND id_produto = $2`,
      [id_estoque, id_produto]
    );

    return res.status(200).json({ message: 'Produto removido do estoque com sucesso' });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao remover produto do estoque',
      error: error.message
    });
  }
};