import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const corsOptions = {
  origin: 'https://strengthvault-front.vercel.app', // Solo permite tu frontend
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true // Esto permite que las cookies/credenciales se envíen
};

app.options('*', cors(corsOptions)); // Manejar solicitudes preflight con las mismas opciones de CORS


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', userRoutes);

export default app;
