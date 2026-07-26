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

const parseCep = (cep) => {
  if (cep === undefined || cep === null || cep === '') return null;

  const cepLimpo = String(cep).replace(/\D/g, '');

  if (cepLimpo === '') return null;

  const cepNumero = Number(cepLimpo);

  if (Number.isNaN(cepNumero)) {
    const error = new Error('CEP inválido');
    error.statusCode = 400;
    throw error;
  }

  return cepNumero;
};

export const createSupplier = async (req, res) => {
  const {
    nome_fornecedor,
    rua,
    bairro,
    cidade,
    estado,
    pais,
    cep,
    email,
    telefone,
    documento,
    tipo_pessoa
  } = req.body;

  if (!nome_fornecedor || nome_fornecedor.trim() === '') {
    return res.status(400).json({ message: 'Nome do fornecedor é obrigatório' });
  }

  try {
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    const supplierExists = await pool.query(
      `SELECT id_fornecedor
       FROM public.fornecedor
       WHERE LOWER(nome_fornecedor) = LOWER($1)
         AND id_usuario = $2`,
      [nome_fornecedor.trim(), id_usuario]
    );

    if (supplierExists.rows.length > 0) {
      return res.status(400).json({ message: 'Fornecedor já existe' });
    }

    const cepNumero = parseCep(cep);

    const result = await pool.query(
      `INSERT INTO public.fornecedor
       (
         nome_fornecedor,
         rua,
         bairro,
         cidade,
         estado,
         pais,
         cep,
         email,
         telefone,
         documento,
         tipo_pessoa,
         id_usuario
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        nome_fornecedor.trim(),
        rua?.trim() || null,
        bairro?.trim() || null,
        cidade?.trim() || null,
        estado?.trim() || null,
        pais?.trim() || null,
        cepNumero,
        email?.trim() || null,
        telefone?.trim() || null,
        documento?.trim() || null,
        tipo_pessoa?.trim() || null,
        id_usuario
      ]
    );

    return res.status(201).json({
      message: 'Fornecedor cadastrado com sucesso',
      fornecedor: result.rows[0]
    });
  } catch (error) {
    console.error('Erro real ao cadastrar fornecedor:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token inválido ou expirado',
        error: error.message
      });
    }

    return res.status(error.statusCode || 500).json({
      message: 'Erro ao cadastrar fornecedor',
      error: error.message
    });
  }
};

export const getSuppliers = async (req, res) => {
  const { search } = req.query;

  try {
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    let query = `
      SELECT *
      FROM public.fornecedor
      WHERE id_usuario = $1
    `;

    const params = [id_usuario];

    if (search && search.trim() !== '') {
      query += ` AND nome_fornecedor ILIKE $2`;
      params.push(`%${search.trim()}%`);
    }

    query += ` ORDER BY nome_fornecedor ASC`;

    const result = await pool.query(query, params);

    if (search !== undefined) {
      return res.status(200).json(result.rows);
    }

    return res.status(200).json({
      message: 'Fornecedores listados com sucesso',
      fornecedores: result.rows
    });
  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token inválido ou expirado',
        error: error.message
      });
    }

    return res.status(error.statusCode || 500).json({
      message: 'Erro ao listar fornecedores',
      error: error.message
    });
  }
};

export const getSupplierById = async (req, res) => {
  const { id } = req.params;

  try {
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    const result = await pool.query(
      `SELECT *
       FROM public.fornecedor
       WHERE id_fornecedor = $1
         AND id_usuario = $2`,
      [id, id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Fornecedor não encontrado' });
    }

    return res.status(200).json({
      message: 'Fornecedor encontrado com sucesso',
      fornecedor: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token inválido ou expirado',
        error: error.message
      });
    }

    return res.status(error.statusCode || 500).json({
      message: 'Erro ao buscar fornecedor',
      error: error.message
    });
  }
};

export const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const {
    nome_fornecedor,
    rua,
    bairro,
    cidade,
    estado,
    pais,
    cep,
    email,
    telefone,
    documento,
    tipo_pessoa
  } = req.body;

  try {
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    const checkSupplier = await pool.query(
      `SELECT *
       FROM public.fornecedor
       WHERE id_fornecedor = $1
         AND id_usuario = $2`,
      [id, id_usuario]
    );

    if (checkSupplier.rows.length === 0) {
      return res.status(404).json({ message: 'Fornecedor não encontrado' });
    }

    if (nome_fornecedor !== undefined && nome_fornecedor.trim() === '') {
      return res.status(400).json({ message: 'Nome do fornecedor não pode ser vazio' });
    }

    const fornecedorAtual = checkSupplier.rows[0];

    let cepNumero;
    if (cep !== undefined) {
      cepNumero = parseCep(cep);
    }

    const result = await pool.query(
      `UPDATE public.fornecedor
       SET nome_fornecedor = $1,
           rua = $2,
           bairro = $3,
           cidade = $4,
           estado = $5,
           pais = $6,
           cep = $7,
           email = $8,
           telefone = $9,
           documento = $10,
           tipo_pessoa = $11
       WHERE id_fornecedor = $12
         AND id_usuario = $13
       RETURNING *`,
      [
        nome_fornecedor !== undefined ? nome_fornecedor.trim() : fornecedorAtual.nome_fornecedor,
        rua !== undefined ? (rua?.trim() || null) : fornecedorAtual.rua,
        bairro !== undefined ? (bairro?.trim() || null) : fornecedorAtual.bairro,
        cidade !== undefined ? (cidade?.trim() || null) : fornecedorAtual.cidade,
        estado !== undefined ? (estado?.trim() || null) : fornecedorAtual.estado,
        pais !== undefined ? (pais?.trim() || null) : fornecedorAtual.pais,
        cep !== undefined ? cepNumero : fornecedorAtual.cep,
        email !== undefined ? (email?.trim() || null) : fornecedorAtual.email,
        telefone !== undefined ? (telefone?.trim() || null) : fornecedorAtual.telefone,
        documento !== undefined ? (documento?.trim() || null) : fornecedorAtual.documento,
        tipo_pessoa !== undefined ? (tipo_pessoa?.trim() || null) : fornecedorAtual.tipo_pessoa,
        id,
        id_usuario
      ]
    );

    return res.status(200).json({
      message: 'Fornecedor atualizado com sucesso',
      fornecedor: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token inválido ou expirado',
        error: error.message
      });
    }

    return res.status(error.statusCode || 500).json({
      message: 'Erro ao atualizar fornecedor',
      error: error.message
    });
  }
};

export const deleteSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    const decoded = getUserFromToken(req);
    const id_usuario = decoded.id_usuario;

    const result = await pool.query(
      `DELETE FROM public.fornecedor
       WHERE id_fornecedor = $1
         AND id_usuario = $2
       RETURNING *`,
      [id, id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Fornecedor não encontrado' });
    }

    return res.status(200).json({
      message: 'Fornecedor excluído com sucesso',
      fornecedor: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao excluir fornecedor:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token inválido ou expirado',
        error: error.message
      });
    }

    return res.status(error.statusCode || 500).json({
      message: 'Erro ao excluir fornecedor',
      error: error.message
    });
  }
};