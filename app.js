import dotenv from 'dotenv';
dotenv.config();  // Debe estar en la primera línea antes de cualquier importación

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import userRoutes from './api/routes/userRoutes.js';
import './services/cronServices.js'; // Aquí importas el cron job

console.log('mongodb://m4rt1n:s0yM4RT1NG4LV4N@62.72.51.41:27017/', process.env.MONGO_URI);

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
