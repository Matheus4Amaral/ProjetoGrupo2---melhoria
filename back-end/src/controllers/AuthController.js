import pool from '../config/database.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const login = async (req, res) => {
    const { email, password } = req.body;

    try{
      const result = await pool.query(
        'SELECT id_usuario, nome_usuario, email, senha FROM public.usuario WHERE email = $1',
        [email]
      )

      if(result.rows.length === 0){
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const usuario = result.rows[0];

      const senhaCorreta = await bcrypt.compare (password, usuario.senha)

      if(!senhaCorreta){
        return res.status(401).json({ message: 'Senha incorreta' })
      }

      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          email: usuario.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      return res.status(200).json({ 
        message: 'Login realizado com sucesso',
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          nome_usuario: usuario.nome_usuario,
          email: usuario.email
        }
       })

    } catch(error){
      return res.status(500).json({
        message: 'Erro ao fazer login',
        error: error.message
      })
    }
}

export const register = async (req, res) => {
  const {
    nome_usuario,
    nome_empresa,
    email,
    cpf_cnpj,
    rua,
    estado,
    cidade,
    pais,
    numero,
    telefone,
    cep,
    bairro,
    senha
  } = req.body;

  try {
    const userExists = await pool.query(
      'SELECT id_usuario FROM public.usuario WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    const hashedSenha = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      `INSERT INTO public.usuario (
        nome_usuario,
        nome_empresa,
        email,
        cpf_cnpj,
        rua,
        estado,
        cidade,
        pais,
        numero,
        telefone,
        cep,
        bairro,
        senha
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id_usuario, nome_usuario, nome_empresa, email`,
      [
        nome_usuario,
        nome_empresa,
        email,
        cpf_cnpj,
        rua,
        estado,
        cidade,
        pais,
        numero,
        telefone,
        cep,
        bairro,
        hashedSenha
      ]
    );

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso",
      usuario: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao cadastrar usuário',
      error: error.message
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = req.user?.id_usuario || req.user?.id || req.query.id_usuario;

    const result = await pool.query(
      `SELECT id_usuario, nome_usuario, nome_empresa, email, cpf_cnpj, telefone, 
              rua, numero, cep, cidade, bairro, pais, estado 
       FROM public.usuario 
       WHERE id_usuario = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro em getUser:', error);
    return res.status(500).json({
      message: 'Erro ao buscar dados do usuário',
      error: error.message
    });
  }
};

export const updateUser = async (req, res) => {
  const {
    id_usuario,
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

  const userId = req.user?.id_usuario || req.user?.id || id_usuario;

  try {
    const result = await pool.query(
      `UPDATE public.usuario 
       SET nome_usuario = $1, 
           nome_empresa = $2, 
           cpf_cnpj = $3, 
           telefone = $4,
           rua = $5, 
           numero = $6, 
           cep = $7, 
           cidade = $8, 
           bairro = $9, 
           pais = $10, 
           estado = $11
       WHERE id_usuario = $12
       RETURNING id_usuario, nome_usuario, nome_empresa, email, cpf_cnpj, telefone, rua, numero, cep, cidade, bairro, pais, estado`,
      [
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
        userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    return res.status(200).json({
      message: 'Perfil atualizado com sucesso!',
      usuario: result.rows[0]
    });
  } catch (error) {
    console.error('Erro em updateUser:', error);
    return res.status(500).json({
      message: 'Erro ao atualizar perfil',
      error: error.message
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "O e-mail é obrigatório." });
  }

  try {
    const userCheck = await pool.query(
      "SELECT id_usuario FROM public.usuario WHERE email = $1",
      [email]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "E-mail não cadastrado no sistema." });
    }

    return res.status(200).json({ message: "E-mail encontrado com sucesso!" });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao processar solicitação.",
      error: error.message
    });
  }
};