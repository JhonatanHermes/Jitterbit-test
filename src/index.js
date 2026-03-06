const express = require('express');
require('dotenv').config();
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rotas
app.use('/order', orderRoutes);

app.get('/', (req, res) => {
  res.send('API de Pedidos Online');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
