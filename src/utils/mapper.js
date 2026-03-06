/**
 * Mapeia o JSON de entrada para o formato do Banco de Dados / Desafio
 */
const mapInputToOrder = (input) => {
  return {
    orderId: input.numeroPedido,
    value: input.valorTotal,
    creationDate: input.dataCriacao,
    items: (input.items || []).map(item => ({
      productId: item.idItem,
      quantity: item.quantidadeItem,
      price: item.valorItem
    }))
  };
};

/**
 * Mapeia o resultado do banco para o formato de resposta do Desafio
 */
const mapDbToOutput = (order, items) => {
  return {
    orderId: order.order_id,
    value: parseFloat(order.value),
    creationDate: order.creation_date,
    items: items.map(item => ({
      productId: item.product_id,
      quantity: item.quantity,
      price: parseFloat(item.price)
    }))
  };
};

module.exports = {
  mapInputToOrder,
  mapDbToOutput
};
