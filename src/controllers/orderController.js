const db = require('../db');
const mapper = require('../utils/mapper');

const createOrder = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const orderData = mapper.mapInputToOrder(req.body);
    
    await client.query('BEGIN');

    // Inserir Pedido
    const orderQuery = 'INSERT INTO orders (order_id, value, creation_date) VALUES ($1, $2, $3)';
    await client.query(orderQuery, [orderData.orderId, orderData.value, orderData.creationDate]);

    // Inserir Itens
    for (const item of orderData.items) {
      const itemQuery = 'INSERT INTO items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)';
      await client.query(itemQuery, [orderData.orderId, item.productId, item.quantity, item.price]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Pedido criado com sucesso', orderId: orderData.orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar pedido', details: error.message });
  } finally {
    client.release();
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const orderRes = await db.query('SELECT * FROM orders WHERE order_id = $1', [orderId]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const itemsRes = await db.query('SELECT * FROM items WHERE order_id = $1', [orderId]);
    
    const output = mapper.mapDbToOutput(orderRes.rows[0], itemsRes.rows);
    res.json(output);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
};

const listOrders = async (req, res) => {
  try {
    const ordersRes = await db.query('SELECT * FROM orders');
    res.json(ordersRes.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
};

const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const { valorTotal } = req.body;
  
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
    res.status(500).json({ error: 'Erro ao atualizar pedido' });
  }
};

const deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const result = await db.query('DELETE FROM orders WHERE order_id = $1 RETURNING *', [orderId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json({ message: 'Pedido deletado com sucesso' });
  } catch (error) {
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
