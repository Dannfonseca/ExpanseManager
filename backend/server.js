/*
 * Removida a lógica condicional de ambiente para servir o frontend.
 * - O servidor agora SEMPRE servirá os arquivos estáticos do frontend como
 * comportamento padrão após tentar resolver as rotas da API.
 * - Isso corrige o problema de deploy no Render de forma definitiva,
 * tornando o código mais simples e robusto.
 */
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import User from './models/User.js';

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

  // Script para atribuir role de admin (pode ser removido após a primeira execução bem-sucedida)
  const assignAdminRole = async () => {
    try {
      const adminEmail = 'russelmytho@gmail.com';
      const adminUser = await User.findOne({ email: adminEmail });

      if (adminUser && adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
        console.log(`Usuário ${adminEmail} foi definido como administrador.`);
      }
    } catch (error) {
      console.error('Erro ao tentar definir o administrador:', error);
    }
  };
  await assignAdminRole();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (req, res) => res.status(200).send('OK'));

  // Definir rotas da API
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/logs', logRoutes);

  // --- Lógica para servir o frontend ---
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const frontendDistPath = path.resolve(__dirname, '..', 'frontend', 'dist');

  // Serve os arquivos estáticos da pasta 'dist' do frontend
  app.use(express.static(frontendDistPath));

  // Para qualquer outra rota que não seja da API, sirva o index.html do frontend
  // Isso é essencial para que o roteamento do React (React Router) funcione.
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  });
  // --- Fim da lógica de produção ---

  // Middlewares de Erro
  app.use(notFound);
  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, console.log(`Servidor rodando na porta ${PORT}`));
};

startServer().catch(err => {
    console.error("Failed to start server:", err);
});
