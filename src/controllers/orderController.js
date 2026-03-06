const db = require('../db');
const mapper = require('../utils/mapper');

/**
 * Cria um novo pedido no banco de dados.
 * Realiza validação de campos obrigatórios e utiliza transações SQL para garantir 
 * a consistência dos dados entre as tabelas 'orders' e 'items'.
 */
const createOrder = async (req, res) => {
  const { numeroPedido, valorTotal, dataCriacao, items } = req.body;

  // Validação básica dos campos obrigatórios
  if (!numeroPedido || !valorTotal || !dataCriacao || !items || !Array.isArray(items)) {
    return res.status(400).json({ 
      error: 'Campos obrigatórios ausentes ou em formato inválido. Requer: numeroPedido, valorTotal, dataCriacao, items.' 
    });
  }

  const client = await db.pool.connect();
  try {
    // Mapeamento dos campos conforme exigência do desafio
    const orderData = mapper.mapInputToOrder(req.body);
    
    // Inicia a transação. Se algum passo falhar, nada será salvo.
    await client.query('BEGIN');

    // Inserção na tabela principal de pedidos
    const orderQuery = 'INSERT INTO orders (order_id, value, creation_date) VALUES ($1, $2, $3)';
    await client.query(orderQuery, [orderData.orderId, orderData.value, orderData.creationDate]);

    // Inserção dos itens vinculados ao pedido
    for (const item of orderData.items) {
      if (!item.productId || !item.quantity || !item.price) {
        throw new Error('Item do pedido incompleto: verifique productId, quantity e price.');
      }
      const itemQuery = 'INSERT INTO items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)';
      await client.query(itemQuery, [orderData.orderId, item.productId, item.quantity, item.price]);
    }

    // Confirma as alterações no banco
    await client.query('COMMIT');
    res.status(201).json({ message: 'Pedido criado com sucesso', orderId: orderData.orderId });
  } catch (error) {
    // Em caso de erro, desfaz qualquer alteração parcial
    await client.query('ROLLBACK');
    console.error('[CreateOrder Error]:', error);
    res.status(500).json({ error: 'Erro ao criar pedido', details: error.message });
  } finally {
    // Libera a conexão de volta para o pool
    client.release();
  }
};

/**
 * Busca os dados de um pedido específico pelo seu ID (order_id).
 * Retorna os dados mapeados conforme o formato de saída do desafio.
 */
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Busca os dados básicos do pedido
    const orderRes = await db.query('SELECT * FROM orders WHERE order_id = $1', [orderId]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Busca os itens vinculados ao pedido
    const itemsRes = await db.query('SELECT * FROM items WHERE order_id = $1', [orderId]);
    
    // Transforma os dados do banco para o formato de saída esperado
    const output = mapper.mapDbToOutput(orderRes.rows[0], itemsRes.rows);
    res.json(output);
  } catch (error) {
    console.error('[GetOrderById Error]:', error);
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
};

/**
 * Lista todos os pedidos cadastrados na tabela 'orders'.
 */
const listOrders = async (req, res) => {
  try {
    const ordersRes = await db.query('SELECT * FROM orders ORDER BY creation_date DESC');
    res.json(ordersRes.rows);
  } catch (error) {
    console.error('[ListOrders Error]:', error);
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
};

/**
 * Atualiza o valor total de um pedido existente.
 */
const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const { valorTotal } = req.body;

  if (valorTotal === undefined) {
    return res.status(400).json({ error: 'O campo valorTotal é obrigatório para atualização.' });
  }
  
  try {
    const result = await db.query(
      'UPDATE orders SET value = $1 WHERE order_id = $2 RETURNING *',
      [valorTotal, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json({ message: 'Pedido atualizado com sucesso' });
  } catch (error) {
    console.error('[UpdateOrder Error]:', error);
    res.status(500).json({ error: 'Erro ao atualizar pedido' });
  }
};

/**
 * Deleta um pedido e todos os seus itens associados (via ON DELETE CASCADE).
 */
const deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const result = await db.query('DELETE FROM orders WHERE order_id = $1 RETURNING *', [orderId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json({ message: 'Pedido deletado com sucesso' });
  } catch (error) {
    console.error('[DeleteOrder Error]:', error);
    res.status(500).json({ error: 'Erro ao deletar pedido' });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
  updateOrder,
  deleteOrder
};
