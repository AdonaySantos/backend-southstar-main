const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Lista de usuários (substitui o banco de dados)
const users = [];

// Lista de posts (alguns com apenas texto, outros com texto e imagem)
const posts = [
    { 
      id: 1,
      userAvatar: "useravatar1.png", 
      userName: "adonay", 
      textContent: "Este é o primeiro post de Adonay com apenas texto.", 
      imageContent: "", 
      likes: 10, 
      date: "2023-10-10"
    },
    { 
      id: 2,
      userAvatar: "useravatar1.png", 
      userName: "adonay", 
      textContent: "Este é o segundo post de Adonay com uma imagem.", 
      imageContent: "imagem1.png", 
      likes: 15, 
      date: "2023-10-11"
    },
    { 
      id: 3,
      userAvatar: "useravatar2.png", 
      userName: "well", 
      textContent: "Este é o primeiro post do Well, apenas com texto.", 
      imageContent: "", 
      likes: 5, 
      date: "2023-10-12"
    },
    { 
      id: 4,
      userAvatar: "useravatar2.png", 
      userName: "well", 
      textContent: "Este é o segundo post do Well, com uma imagem.", 
      imageContent: "imagem2.png", 
      likes: 12, 
      date: "2023-10-13"
    }
];

// Segredo JWT
const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_jwt';

// Função para adicionar usuários padrão
async function addDefaultUsers() {
  const defaultUsers = [
    {
      id: 1,
      name: 'adonay',
      password: await bcrypt.hash(process.env.ADONAY_PASSWORD, 10), // Senha a partir de variável do .env
      avatar: 'useravatar1.png' // Adicionando campo de avatar
    },
    {
      id: 2,
      name: 'well',
      password: await bcrypt.hash(process.env.WELL_PASSWORD, 10), // Senha a partir de variável do .env
      avatar: 'useravatar2.png' // Adicionando campo de avatar
    }
  ];

  users.push(...defaultUsers);
}

// Adicionar usuários padrão ao iniciar
addDefaultUsers();

// Rota para cadastrar novos usuários
router.post('/register', async (req, res) => {
  const { name, password, avatar } = req.body; // Incluindo avatar nos dados recebidos

  // Verificar se o usuário já existe
  const existingUser = users.find((u) => u.name === name);
  if (existingUser) {
    return res.status(400).json({ message: 'Usuário já existe!' });
  }

  try {
    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Adicionar o novo usuário à lista
    const newUser = { id: users.length + 1, name, password: hashedPassword, avatar }; // Adicionando o campo avatar
    users.push(newUser);

    res.status(201).json({ message: 'Cadastro bem-sucedido!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cadastrar o usuário!' });
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  const { name, password } = req.body;

  // Encontrar o usuário na lista
  const user = users.find((u) => u.name === name);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  // Verificar a senha
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Senha incorreta' });
  }

  // Gerar token JWT
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

  res.json({
    message: 'Login bem-sucedido!',
    token,
    avatar: user.avatar, // Retornando o avatar no login
  });
});

// Middleware para autenticação de usuário
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Pega o token enviado no header

  if (!token) {
    return res.status(401).json({ message: 'Autenticação necessária!' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Armazena os dados do usuário decodificados no objeto `req`
    next(); // Prossegue para a rota
  } catch (err) {
    res.status(401).json({ message: 'Token inválido!' });
  }
};

// Rota para curtir ou remover like de um post
router.post('/like/:postId', authenticate, (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId; // Obtém o ID do usuário a partir do token JWT

  // Encontrar o post
  const post = posts.find((p) => p.id === parseInt(postId));
  if (!post) {
    return res.status(404).json({ message: 'Post não encontrado' });
  }

  // Verificar se o usuário já deu like
  if (post.likedBy.includes(userId)) {
    // Remove o like
    post.likedBy = post.likedBy.filter((id) => id !== userId);
    post.likes -= 1;
    return res.status(200).json({ message: 'Like removido', likes: post.likes });
  } else {
    // Adiciona o like
    post.likedBy.push(userId);
    post.likes += 1;
    return res.status(200).json({ message: 'Like adicionado', likes: post.likes });
  }
});

// Rota para visualizar todos os usuários cadastrados (apenas para testes)
router.get('/users', (req, res) => {
  res.json(users);
});

// Rota para visualizar todos os posts (apenas para testes)
router.get('/posts', (req, res) => {
  res.json(posts);
});

module.exports = router;
