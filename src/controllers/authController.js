const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const userRes = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = userRes.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });


    res.json({ user: { username: user.username }, token });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

module.exports = { login };
