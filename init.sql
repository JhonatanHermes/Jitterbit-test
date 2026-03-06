-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS orders (
    order_id VARCHAR(50) PRIMARY KEY,
    value DECIMAL(10, 2) NOT NULL,
    creation_date TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);
