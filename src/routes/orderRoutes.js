const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Criar um novo pedido (Obrigatório)
router.post('/', orderController.createOrder);

// Listar todos os pedidos (Opcional)
router.get('/list', orderController.listOrders);

// Obter dados de um pedido específico (Obrigatório)
router.get('/:orderId', orderController.getOrderById);

// Atualizar um pedido (Opcional)
router.put('/:orderId', orderController.updateOrder);

// Deletar um pedido (Opcional)
router.delete('/:orderId', orderController.deleteOrder);

module.exports = router;
