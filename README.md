# Desafio API de Pedidos Online - Node.js + PostgreSQL

Esta é uma API desenvolvida em **Node.js** com **Express** e **PostgreSQL** para o gerenciamento de pedidos, seguindo rigorosos padrões de mapeamento de dados.

## 🚀 Tecnologias Utilizadas

- **Node.js** (Ambiente de execução)
- **Express.js** (Framework web)
- **PostgreSQL** (Banco de dados relacional)
- **pg** (Driver de conexão PostgreSQL para Node.js)
- **dotenv** (Gerenciamento de variáveis de ambiente)

## 🛠️ Configuração do Ambiente

### 1. Banco de Dados (PostgreSQL)

1. Certifique-se de que o PostgreSQL está rodando em sua máquina (Porta padrão: `5432`).
2. Abra o seu gerenciador de banco de dados (ex: **DBeaver**).
3. Execute o script contido no arquivo `init.sql` presente na raiz deste projeto. Este script criará as tabelas `orders` e `items` com os relacionamentos necessários.

### 2. Variáveis de Ambiente

Crie ou edite o arquivo `.env` na raiz do projeto e configure suas credenciais:

```env
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=postgres
DB_PASSWORD=admin
DB_PORT=5432
```

### 3. Instalação e Execução

No terminal, execute os seguintes comandos:

```bash
# Instalar dependências
npm install

# Iniciar a API
npm start
```

A API estará disponível em `http://localhost:3000`.

---

## 📌 Endpoints da API

### 1. Criar um novo pedido
- **URL**: `POST /order`
- **Exemplo de Body (JSON Original)**:
```json
{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}
```

### 2. Obter dados de um pedido
- **URL**: `GET /order/:orderId`
- **Exemplo**: `http://localhost:3000/order/v10089015vdb-01`

### 3. Listar todos os pedidos
- **URL**: `GET /order/list`

### 4. Atualizar valor de um pedido
- **URL**: `PUT /order/:orderId`
- **Body**: `{ "valorTotal": 12000 }`

### 5. Deletar um pedido
- **URL**: `DELETE /order/:orderId`

---

## 📐 Mapeamento de Dados (Requisito do Desafio)

A API realiza automaticamente a transformação do JSON recebido para o formato do banco de dados:

| JSON Entrada (Request) | Banco de Dados / Saída |
| :--- | :--- |
| `numeroPedido` | `orderId` |
| `valorTotal` | `value` |
| `dataCriacao` | `creationDate` |
| `idItem` | `productId` |
| `quantidadeItem` | `quantity` |
| `valorItem` | `price` |

---
*Desenvolvido como parte de um desafio técnico.*
