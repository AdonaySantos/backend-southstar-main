const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth'); // Importando as rotas de autenticação
const cors = require('cors');

// Carregar variáveis de ambiente
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Rotas
app.use(cors());
app.use('/', authRoutes); // Rotas de autenticação

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
