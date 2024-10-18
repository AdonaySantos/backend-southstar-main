const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
require('dotenv').config();

// Lista de usuários (substitui o banco de dados)
const users = [];

// Função para adicionar usuários padrão à lista
async function addDefaultUsers() {
  const defaultUsers = [
    { id: 1, name: 'adonay', password: process.env.ADONAY_PASSWORD },
    { id: 2, name: 'well', password: process.env.WELL_PASSWORD },
  ];

  for (const user of defaultUsers) {
    // Criptografar a senha antes de adicionar à lista
    const hashedPassword = await bcrypt.hash(user.password, 10);
    users.push({ id: user.id, name: user.name, password: hashedPassword });
  }
}

// Chamar a função para adicionar os usuários padrão
addDefaultUsers();

// Função para comparar senha criptografada
async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// Rota de login
router.post('/login', async (req, res) => {
  const { name, password } = req.body;

  // Encontrar o usuário na lista
  const user = users.find((u) => u.name === name);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  // Verificar a senha
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Senha incorreta' });
  }

  // Gerar token JWT
  const token = jwt.sign({ userId: user.id }, 'seu_segredo_jwt', {
    expiresIn: '1h',
  });

  res.json({
    message: 'Login bem-sucedido!',
    token,
  });
});

module.exports = router;
