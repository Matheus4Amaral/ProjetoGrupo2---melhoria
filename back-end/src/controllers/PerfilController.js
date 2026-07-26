import pool from '../config/database.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const getUser = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token mal formatado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      `SELECT 
        id_usuario,
        nome_usuario,
        nome_empresa,
        email,
        cpf_cnpj,
        rua,
        numero,
        estado,
        cidade,
        pais,
        telefone,
        cep,
        bairro
      FROM public.usuario
      WHERE id_usuario = $1`,
      [decoded.id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido ou expirado",
      error: error.message
    });
  }
};

export const updateUser = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token mal formatado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const {
      nome_usuario,
      nome_empresa,
      cpf_cnpj,
      telefone,
      rua,
      numero,
      cep,
      cidade,
      bairro,
      pais,
      estado,
    } = req.body;

    const result = await pool.query(
      `UPDATE public.usuario
       SET nome_usuario = $1, nome_empresa = $2, cpf_cnpj = $3, telefone = $4,
           rua = $5, numero = $6, cep = $7, cidade = $8, bairro = $9, pais = $10, estado = $11
       WHERE id_usuario = $12
       RETURNING *`,
      [nome_usuario, nome_empresa, cpf_cnpj, telefone, rua, numero, cep, cidade, bairro, pais, estado, decoded.id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json({
      message: "Perfil atualizado com sucesso",
      usuario: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar perfil",
      error: error.message
    });
  }
};

export const changePassword = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token mal formatado" });
  }

  const { senhaAtual, novaSenha } = req.body;

  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({
      message: "Senha atual e nova senha são obrigatórias"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      `SELECT id_usuario, senha
       FROM public.usuario
       WHERE id_usuario = $1`,
      [decoded.id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const usuario = result.rows[0];

    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ message: "Senha atual incorreta" });
    }

    if (senhaAtual === novaSenha) {
      return res.status(400).json({
        message: "A nova senha não pode ser igual à senha atual"
      });
    }

    const hashedNovaSenha = await bcrypt.hash(novaSenha, 10);

    await pool.query(
      `UPDATE public.usuario
       SET senha = $1
       WHERE id_usuario = $2`,
      [hashedNovaSenha, decoded.id_usuario]
    );

    return res.status(200).json({
      message: "Senha alterada com sucesso"
    });
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido ou expirado",
      error: error.message
    });
  }
};