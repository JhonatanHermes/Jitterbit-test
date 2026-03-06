const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function setup() {
  try {
    const sqlPath = path.join(__dirname, '..', 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Adicionando tabela de usuários para o Auth
    const userTableSql = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
    `;

    console.log('Conectando ao banco e criando tabelas...');
    await pool.query(sql);
    await pool.query(userTableSql);
    
    // Criar um usuário padrão para teste: admin / admin123
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING',
      ['admin', hashedPassword]
    );

    console.log('Tabelas criadas e usuário "admin" configurado com sucesso!');
  } catch (err) {
    console.error('Erro ao configurar banco:', err);
  } finally {
    await pool.end();
  }
}

setup();
