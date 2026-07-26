import pool from '../config/database.js';
import jwt from 'jsonwebtoken';

const getUserFromToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Token não fornecido ou mal formatado');
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(' ')[1];
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const createProduct = async (req, res) => {
  const {
    nome_produto,
    categoria,
    peso,
    preco_compra,
    volume,
    descricao,
    lote,
    preco_venda,
    quantidade_inicial,
    id_estoque,
    id_fornecedor
  } = req.body;

  if (!nome_produto || nome_produto.trim() === '') {
    return res.status(400).json({ message: 'Nome do produto é obrigatório' });
  }

  if (nome_produto.length > 255) {
    return res.status(400).json({ message: 'Nome do produto não pode ter mais de 255 caracteres' });
  }

  if (!categoria || categoria.trim() === '') {
    return res.status(400).json({ message: 'Categoria é obrigatória' });
  }

  if (preco_compra === undefined || preco_compra === null || Number(preco_compra) <= 0) {
    return res.status(400).json({ message: 'Preço de compra deve ser maior que zero' });
  }

  if (preco_venda === undefined || preco_venda === null || Number(preco_venda) <= 0) {
    return res.status(400).json({ message: 'Preço de venda deve ser maior que zero' });
  }

  if (quantidade_inicial === undefined || quantidade_inicial === null || Number(quantidade_inicial) < 0) {
    return res.status(400).json({ message: 'Quantidade inicial é obrigatória e não pode ser negativa' });
  }

  if (!id_estoque) {
    return res.status(400).json({ message: 'ID do estoque é obrigatório' });
  }

  const client = await pool.connect();

  try {
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    await client.query('BEGIN');

    const estoqueResult = await client.query(
      `SELECT id_estoque
       FROM public.estoque
       WHERE id_estoque = $1 AND id_usuario = $2`,
      [id_estoque, id_usuario]
    );

    if (estoqueResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Estoque não encontrado para este usuário' });
    }

    if (id_fornecedor !== undefined && id_fornecedor !== null && id_fornecedor !== '') {
      const fornecedorResult = await client.query(
        `SELECT id_fornecedor
         FROM public.fornecedor
         WHERE id_fornecedor = $1 AND id_usuario = $2`,
        [id_fornecedor, id_usuario]
      );

      if (fornecedorResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(403).json({ message: 'Fornecedor não encontrado para este usuário' });
      }
    }

    const resultProduct = await client.query(
      `INSERT INTO public.produto
       (
         nome_produto,
         categoria,
         peso,
         preco_compra,
         volume,
         descricao,
         lote,
         data_cadastro,
         preco_venda,
         id_usuario,
         id_fornecedor
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, $8, $9, $10)
       RETURNING *`,
      [
        nome_produto.trim(),
        categoria.trim(),
        peso === undefined || peso === null || peso === '' ? null : Number(peso),
        Number(preco_compra),
        volume === undefined || volume === null || volume === '' ? null : Number(volume),
        descricao === undefined || descricao === null || descricao.trim() === '' ? null : descricao.trim(),
        lote === undefined || lote === null || lote === '' ? null : Number(lote),
        Number(preco_venda),
        id_usuario,
        id_fornecedor === undefined || id_fornecedor === null || id_fornecedor === '' ? null : Number(id_fornecedor)
      ]
    );

    const produto = resultProduct.rows[0];

    await client.query(
      `INSERT INTO public.possui_estoque
       (id_estoque, id_produto, quantidade_estoque_total, quantidade_estoque_atual)
       VALUES ($1, $2, $3, $4)`,
      [id_estoque, produto.id_produto, Number(quantidade_inicial), Number(quantidade_inicial)]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Produto cadastrado com sucesso',
      produto
    });
  } catch (error) {
    await client.query('ROLLBACK');

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token inválido ou expirado',
        error: error.message
      });
    }

    return res.status(error.statusCode || 500).json({
      message: 'Erro ao cadastrar produto',
      error: error.message
    });
  } finally {
    client.release();
  }
};

export const getProducts = async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    const result = await pool.query(
      `SELECT
         p.id_produto,
         p.nome_produto,
         p.categoria,
         p.peso,
         p.preco_compra,
         p.volume,
         p.descricao,
         p.lote,
         p.data_cadastro,
         p.preco_venda,
         p.id_fornecedor,
         f.nome_fornecedor
       FROM public.produto p
       LEFT JOIN public.fornecedor f
         ON f.id_fornecedor = p.id_fornecedor
       WHERE p.id_usuario = $1
       ORDER BY p.nome_produto`,
      [id_usuario]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: 'Erro ao buscar produtos',
      error: error.message
    });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    const result = await pool.query(
      `SELECT
         p.*,
         f.nome_fornecedor
       FROM public.produto p
       LEFT JOIN public.fornecedor f
         ON f.id_fornecedor = p.id_fornecedor
       WHERE p.id_produto = $1
         AND p.id_usuario = $2`,
      [id, id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: 'Erro ao buscar produto',
      error: error.message
    });
  }
};

export const getProductByName = async (req, res) => {
  const { nome } = req.query;

  if (!nome || nome.trim() === '') {
    return res.status(400).json({ message: 'Nome do produto é obrigatório' });
  }

  try {
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    const result = await pool.query(
      `SELECT
         p.*,
         f.nome_fornecedor
       FROM public.produto p
       LEFT JOIN public.fornecedor f
         ON f.id_fornecedor = p.id_fornecedor
       WHERE p.id_usuario = $1
         AND LOWER(p.nome_produto) LIKE LOWER($2)
       ORDER BY p.nome_produto`,
      [id_usuario, `%${nome}%`]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: 'Erro ao buscar produtos por nome',
      error: error.message
    });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    nome_produto,
    categoria,
    peso,
    preco_compra,
    volume,
    descricao,
    lote,
    preco_venda,
    id_fornecedor
  } = req.body;

  if (
    nome_produto === undefined &&
    categoria === undefined &&
    peso === undefined &&
    preco_compra === undefined &&
    volume === undefined &&
    descricao === undefined &&
    lote === undefined &&
    preco_venda === undefined &&
    id_fornecedor === undefined
  ) {
    return res.status(400).json({ message: 'Informe ao menos um campo para atualizar' });
  }

  if (nome_produto !== undefined && (nome_produto.trim() === '' || nome_produto.length > 255)) {
    return res.status(400).json({ message: 'Nome inválido' });
  }

  if (categoria !== undefined && categoria.trim() === '') {
    return res.status(400).json({ message: 'Categoria inválida' });
  }

  if (preco_compra !== undefined && Number(preco_compra) <= 0) {
    return res.status(400).json({ message: 'Preço de compra deve ser maior que zero' });
  }

  if (preco_venda !== undefined && Number(preco_venda) <= 0) {
    return res.status(400).json({ message: 'Preço de venda deve ser maior que zero' });
  }

  try {
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    const atual = await pool.query(
      `SELECT *
       FROM public.produto
       WHERE id_produto = $1
         AND id_usuario = $2`,
      [id, id_usuario]
    );

    if (atual.rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    if (id_fornecedor !== undefined && id_fornecedor !== null && id_fornecedor !== '') {
      const fornecedorResult = await pool.query(
        `SELECT id_fornecedor
         FROM public.fornecedor
         WHERE id_fornecedor = $1 AND id_usuario = $2`,
        [id_fornecedor, id_usuario]
      );

      if (fornecedorResult.rows.length === 0) {
        return res.status(403).json({ message: 'Fornecedor não encontrado para este usuário' });
      }
    }

    const produtoAtual = atual.rows[0];

    const result = await pool.query(
      `UPDATE public.produto
       SET nome_produto = $1,
           categoria = $2,
           peso = $3,
           preco_compra = $4,
           volume = $5,
           descricao = $6,
           lote = $7,
           preco_venda = $8,
           id_fornecedor = $9
       WHERE id_produto = $10
         AND id_usuario = $11
       RETURNING *`,
      [
        nome_produto !== undefined ? nome_produto.trim() : produtoAtual.nome_produto,
        categoria !== undefined ? categoria.trim() : produtoAtual.categoria,
        peso !== undefined ? (peso === null || peso === '' ? null : Number(peso)) : produtoAtual.peso,
        preco_compra !== undefined ? Number(preco_compra) : produtoAtual.preco_compra,
        volume !== undefined ? (volume === null || volume === '' ? null : Number(volume)) : produtoAtual.volume,
        descricao !== undefined ? (descricao === null || descricao.trim() === '' ? null : descricao.trim()) : produtoAtual.descricao,
        lote !== undefined ? (lote === null || lote === '' ? null : Number(lote)) : produtoAtual.lote,
        preco_venda !== undefined ? Number(preco_venda) : produtoAtual.preco_venda,
        id_fornecedor !== undefined
          ? (id_fornecedor === null || id_fornecedor === '' ? null : Number(id_fornecedor))
          : produtoAtual.id_fornecedor,
        id,
        id_usuario
      ]
    );

    return res.status(200).json({
      message: 'Produto atualizado com sucesso',
      produto: result.rows[0]
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: 'Erro ao atualizar produto',
      error: error.message
    });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    const result = await pool.query(
      `DELETE FROM public.produto
       WHERE id_produto = $1
         AND id_usuario = $2
       RETURNING id_produto`,
      [id, id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    return res.status(200).json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: 'Erro ao excluir produto',
      error: error.message
    });
  }
};