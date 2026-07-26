import pool from '../config/database.js'

export const createSale = async (req, res) => {
  const { descricao, data_venda, valor_venda, id_usuario, cliente_id, produtos } = req.body

  if (!Array.isArray(produtos) || produtos.length === 0) {
    return res.status(400).json({ message: 'Informe ao menos um produto para a venda' })
  }

  const client = await pool.connect() //conexão bd

  try {
    await client.query('BEGIN')

    const insertSale = await client.query(
      `INSERT INTO public.venda (descricao, data_venda, id_usuario, valor_venda)
       VALUES ($1, COALESCE($2, CURRENT_DATE), $3, $4)
       RETURNING id_venda`,
      [descricao || null, data_venda || null, id_usuario || null, valor_venda || null]
    )

    // guarda id da venda feita
    const id_venda = insertSale.rows[0].id_venda

    for (const item of produtos) {
      const { id_produto, quantidade_venda } = item

      if (!id_produto || !quantidade_venda) {
        await client.query('ROLLBACK') //desfaz 
        return res.status(400).json({
          message: 'Cada produto precisa ter id_produto e quantidade_venda'
        })
      }

      await client.query(
        `INSERT INTO public.possui_venda (id_venda, id_produto, quantidade_venda)
         VALUES ($1, $2, $3)`,
        [id_venda, id_produto, quantidade_venda]
      )
    }

    if (cliente_id) {
      await client.query(
        `INSERT INTO public.possui_cliente (id_cliente, id_venda)
         VALUES ($1, $2)`,
        [cliente_id, id_venda]
      )
    }

    await client.query('COMMIT') // salvar de vez todas as alterações feitas desde o begin

    return res.status(201).json({
      message: 'Venda criada com sucesso',
      id_venda
    })
  } catch (error) {
    await client.query('ROLLBACK')
    return res.status(500).json({
      message: 'Erro ao criar venda',
      error: error.message
    })
  } finally {
    client.release()
  }
}

export const getSales = async (req, res) => {
  try {
    const result = await pool.query(`
  SELECT 
    venda.id_venda,
    venda.descricao,
    venda.data_venda,
    venda.valor_venda,
    COALESCE(SUM(possui_venda.quantidade_venda), 0) as total_itens
  FROM venda 
  LEFT JOIN possui_venda ON venda.id_venda = possui_venda.id_venda
  GROUP BY venda.id_venda
`)
    return res.status(200).json(result.rows) //array de linhas q o bd devolveu
  }

  catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar vendas',
      error: error.message
    })
  }
}

export const getSaleById = async (req, res) => {
  const { id } = req.params

  try {
    const vendaResult = await pool.query(
      'SELECT id_venda, descricao, data_venda, id_usuario, valor_venda FROM public.venda WHERE id_venda = $1',
      [id]
    )

    if (vendaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Venda não encontrada' })
    }

    const venda = vendaResult.rows[0]

    const produtosResult = await pool.query(
      `SELECT 
        pv.id_produto,
        pv.quantidade_venda,
        p.nome_produto,
        p.preco_venda,
        p.categoria
      FROM public.possui_venda pv
      INNER JOIN public.produto p ON pv.id_produto = p.id_produto
      WHERE pv.id_venda = $1`,
      [id]
    )

    const itens = produtosResult.rows.map(produto => ({
      id: produto.id_produto,
      nome: produto.nome_produto,
      preco: produto.preco_venda,
      quantidade: produto.quantidade_venda,
      categoria: produto.categoria
    }))

    return res.status(200).json({
      ...venda,
      itens
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao buscar venda',
      error: error.message
    })
  }
}

export const deleteSale = async (req, res) => {
  const { id } = req.params
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Verifica se a venda existe antes de deletar
    const checkSale = await client.query(
      'SELECT * FROM public.venda WHERE id_venda = $1',
      [id]
    )

    if (checkSale.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Venda não encontrada' })
    }

    //remove todos os produtos que estavam ligados a essa venda
    await client.query(
      'DELETE FROM public.possui_venda WHERE id_venda = $1',
      [id]
    )

    //remove o cliente vinculado a essa venda
    await client.query(
      'DELETE FROM public.possui_cliente WHERE id_venda = $1',
      [id]
    )

    //remove a própria venda
    await client.query(
      'DELETE FROM public.venda WHERE id_venda = $1',
      [id]
    )

    await client.query('COMMIT')

    return res.status(200).json({ message: 'Venda excluída com sucesso' })
  } catch (error) {
    await client.query('ROLLBACK')
    return res.status(500).json({
      message: 'Erro ao excluir venda',
      error: error.message
    })
  } finally {
    client.release()
  }
}

export const incrementProduct = async (req, res) => {
  const { id_venda, id_produto } = req.params
  const { quantidade } = req.body

  if (!quantidade || quantidade <= 0) {
    return res.status(400).json({ message: 'Quantidade deve ser maior que zero' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const checkProduct = await client.query(
      'SELECT quantidade_venda FROM public.possui_venda WHERE id_venda = $1 AND id_produto = $2',
      [id_venda, id_produto]
    )

    if (checkProduct.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Produto não encontrado nesta venda' })
    }

    const novaQuantidade = checkProduct.rows[0].quantidade_venda + quantidade

    await client.query(
      'UPDATE public.possui_venda SET quantidade_venda = $1 WHERE id_venda = $2 AND id_produto = $3',
      [novaQuantidade, id_venda, id_produto]
    )

    await client.query('COMMIT')

    return res.status(200).json({
      message: 'Quantidade incrementada com sucesso',
      quantidade_anterior: checkProduct.rows[0].quantidade_venda,
      quantidade_nova: novaQuantidade
    })
  } catch (error) {
    await client.query('ROLLBACK')
    return res.status(500).json({
      message: 'Erro ao incrementar produto',
      error: error.message
    })
  } finally {
    client.release()
  }
}

export const decrementProduct = async (req, res) => {
  const { id_venda, id_produto } = req.params
  const { quantidade } = req.body

  //verifica se a qtd não é menor ou igual a 0
  if (!quantidade || quantidade <= 0) {
    return res.status(400).json({ message: 'Quantidade deve ser maior que zero' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const checkProduct = await client.query(
      'SELECT quantidade_venda FROM public.possui_venda WHERE id_venda = $1 AND id_produto = $2',
      [id_venda, id_produto]
    )

    //verifica se o produto existe na venda
    if (checkProduct.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Produto não encontrado nesta venda' })
    }

    const quantidadeAtual = checkProduct.rows[0].quantidade_venda
    const novaQuantidade = quantidadeAtual - quantidade

    if (novaQuantidade < 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        message: 'Quantidade resultante não pode ser negativa',
        quantidade_atual: quantidadeAtual,
        quantidade_solicitada: quantidade
      })
    }

    if (novaQuantidade === 0) {
      await client.query(
        'DELETE FROM public.possui_venda WHERE id_venda = $1 AND id_produto = $2',
        [id_venda, id_produto]
      )

      await client.query('COMMIT')

      return res.status(200).json({
        message: 'Produto removido da venda (quantidade zerada)',
        quantidade_anterior: quantidadeAtual,
        quantidade_nova: 0
      })
    }

    await client.query(
      'UPDATE public.possui_venda SET quantidade_venda = $1 WHERE id_venda = $2 AND id_produto = $3',
      [novaQuantidade, id_venda, id_produto]
    )

    await client.query('COMMIT')

    return res.status(200).json({
      message: 'Quantidade decrementada com sucesso',
      quantidade_anterior: quantidadeAtual,
      quantidade_nova: novaQuantidade
    })
  } catch (error) {
    await client.query('ROLLBACK')
    return res.status(500).json({
      message: 'Erro ao decrementar produto',
      error: error.message
    })
  } finally {
    client.release()
  }
}

export const updateSale = async (req, res) => {
  const { id } = req.params
  const { descricao, data_venda, valor_venda } = req.body

  if (!descricao && !data_venda && valor_venda === undefined) {
    return res.status(400).json({ message: 'Informe ao menos um campo para atualizar' })
  }

  if (valor_venda !== undefined && valor_venda < 0) {
    return res.status(400).json({ message: 'Valor da venda não pode ser negativo' })
  }

  try {
    // Busca a venda atual
    const checkSale = await pool.query(
      'SELECT * FROM public.venda WHERE id_venda = $1',
      [id]
    )

    if (checkSale.rows.length === 0) {
      return res.status(404).json({ message: 'Venda não encontrada' })
    }

    const vendaAtual = checkSale.rows[0]

    // Usa os valores enviados OU mantém os valores atuais
    const novaDescricao = descricao !== undefined ? descricao : vendaAtual.descricao
    const novaData = data_venda !== undefined ? data_venda : vendaAtual.data_venda
    const novoValor = valor_venda !== undefined ? valor_venda : vendaAtual.valor_venda

    const result = await pool.query(
      `UPDATE public.venda 
       SET descricao = $1, data_venda = $2, valor_venda = $3 
       WHERE id_venda = $4 
       RETURNING *`,
      [novaDescricao, novaData, novoValor, id]
    )

    return res.status(200).json({
      message: 'Venda atualizada com sucesso',
      venda: result.rows[0]
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao atualizar venda',
      error: error.message
    })
  }
}

// Adicionar produto à venda
export const addProductToSale = async (req, res) => {
  const { id_venda } = req.params
  const { id_produto, quantidade_venda } = req.body

  if (!id_produto || !quantidade_venda) {
    return res.status(400).json({ message: 'id_produto e quantidade_venda são obrigatórios' })
  }

  if (quantidade_venda <= 0) {
    return res.status(400).json({ message: 'Quantidade deve ser maior que zero' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Verifica se o produto já existe nesta venda
    const checkProduct = await client.query(
      'SELECT * FROM public.possui_venda WHERE id_venda = $1 AND id_produto = $2',
      [id_venda, id_produto]
    )

    if (checkProduct.rows.length > 0) {
      return res.status(400).json({ message: 'Produto já existe nesta venda. Use incrementar/decrementar.' })
    }

    await client.query(
      'INSERT INTO public.possui_venda (id_venda, id_produto, quantidade_venda) VALUES ($1, $2, $3)',
      [id_venda, id_produto, quantidade_venda]
    )

    await client.query('COMMIT')

    return res.status(201).json({ message: 'Produto adicionado à venda com sucesso' })
  } catch (error) {
    await client.query('ROLLBACK')
    return res.status(500).json({
      message: 'Erro ao adicionar produto à venda',
      error: error.message
    })
  } finally {
    client.release()
  }
}

// Atualizar quantidade de produto na venda
export const updateProductInSale = async (req, res) => {
  const { id_venda, id_produto } = req.params
  const { quantidade_venda } = req.body

  if (!quantidade_venda || quantidade_venda <= 0) {
    return res.status(400).json({ message: 'Quantidade deve ser maior que zero' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const result = await client.query(
      'UPDATE public.possui_venda SET quantidade_venda = $1 WHERE id_venda = $2 AND id_produto = $3 RETURNING *',
      [quantidade_venda, id_venda, id_produto]
    )

    if (result.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Produto não encontrado nesta venda' })
    }

    await client.query('COMMIT')

    return res.status(200).json({
      message: 'Quantidade atualizada com sucesso',
      produto: result.rows[0]
    })
  } catch (error) {
    await client.query('ROLLBACK')
    return res.status(500).json({
      message: 'Erro ao atualizar produto na venda',
      error: error.message
    })
  } finally {
    client.release()
  }
}

// 
export const updateSaleWithProducts = async (req, res) => {
  const { id } = req.params
  const { descricao, data_venda, valor_venda, produtos } = req.body

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const checkSale = await client.query(
      'SELECT * FROM public.venda WHERE id_venda = $1',
      [id]
    )

    if (checkSale.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Venda não encontrada' })
    }

    const vendaAtual = checkSale.rows[0]

    const novaDescricao = descricao !== undefined ? descricao : vendaAtual.descricao
    const novaData = data_venda !== undefined ? data_venda : vendaAtual.data_venda
    const novoValor = valor_venda !== undefined ? valor_venda : vendaAtual.valor_venda

    await client.query(
      `UPDATE public.venda 
       SET descricao = $1, data_venda = $2, valor_venda = $3 
       WHERE id_venda = $4`,
      [novaDescricao, novaData, novoValor, id]
    )

    if (produtos && Array.isArray(produtos)) {
      for (const item of produtos) {
        const { id_produto, quantidade_venda } = item

        if (!id_produto || !quantidade_venda || quantidade_venda <= 0) {
          await client.query('ROLLBACK')
          return res.status(400).json({
            message: 'Cada produto precisa ter id_produto e quantidade_venda válidos'
          })
        }

        const checkProduct = await client.query(
          'SELECT * FROM public.possui_venda WHERE id_venda = $1 AND id_produto = $2',
          [id, id_produto]
        )

        if (checkProduct.rows.length > 0) {
          await client.query(
            'UPDATE public.possui_venda SET quantidade_venda = $1 WHERE id_venda = $2 AND id_produto = $3',
            [quantidade_venda, id, id_produto]
          )
        } else {
          await client.query(
            `INSERT INTO public.possui_venda (id_venda, id_produto, quantidade_venda)
             VALUES ($1, $2, $3)`,
            [id, id_produto, quantidade_venda]
          )
        }
      }
    }

    await client.query('COMMIT')

    return res.status(200).json({
      message: 'Venda atualizada com sucesso',
      id_venda: id
    })
  } catch (error) {
    await client.query('ROLLBACK')
    return res.status(500).json({
      message: 'Erro ao atualizar venda',
      error: error.message
    })
  } finally {
    client.release()
  }
}
