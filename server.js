const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve arquivos estáticos da pasta /avatares e /postImages
app.use('/posts', express.static(path.join(__dirname, 'avatares')));
app.use('/posts', express.static(path.join(__dirname, 'postImages')));

// Usar as rotas de autenticação
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
