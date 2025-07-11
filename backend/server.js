import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import User from './models/User.js'; // Importar o modelo User

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import logRoutes from './routes/logRoutes.js';

dotenv.config();

const app = express();

const startServer = async () => {
  await connectDB();

  // --- SCRIPT PARA ATRIBUIR ROLE DE ADMIN (EXECUTAR UMA VEZ) ---
  const assignAdminRole = async () => {
    try {
      const adminEmail = 'russelmytho@gmail.com';
      const adminUser = await User.findOne({ email: adminEmail });

      if (adminUser && adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
        console.log(`Usuário ${adminEmail} foi definido como administrador.`);
      } else if (!adminUser) {
        console.log(`Usuário ${adminEmail} não encontrado. Nenhum administrador foi definido.`);
      } else {
        // console.log(`Usuário ${adminEmail} já é um administrador.`);
      }
    } catch (error) {
      console.error('Erro ao tentar definir o administrador:', error);
    }
  };
  await assignAdminRole();
  // --- FIM DO SCRIPT ---

  app.use(cors());
  app.use(express.json());

  // Health check endpoint para manter o servidor ativo
  app.get('/health', (req, res) => res.status(200).send('OK'));

  // Definir rotas da API
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/logs', logRoutes);

  // --- Lógica para servir o frontend em produção ---
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  if (process.env.NODE_ENV === 'production') {
    const frontendDistPath = path.resolve(__dirname, '..', 'frontend', 'dist');
    app.use(express.static(frontendDistPath));

    app.get('*', (req, res) => {
      res.sendFile(path.resolve(frontendDistPath, 'index.html'));
    });
  } else {
    app.get('/', (req, res) => {
      res.send('API está rodando em modo de desenvolvimento...');
    });
  }
  // --- Fim da lógica de produção ---

  // Middlewares de Erro
  app.use(notFound);
  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, console.log(`Servidor rodando no modo ${process.env.NODE_ENV} na porta ${PORT}`));
};

startServer().catch(err => {
    console.error("Failed to start server:", err);
});
