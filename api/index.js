import dotenv from 'dotenv';
dotenv.config();  // Debe estar en la primera línea antes de cualquier importación

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import './../services/cronServices.js'; // Aquí importas el cron job
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.options('*', function (req,res) { res.sendStatus(200); });
app.use(express.urlencoded({ extended: true}))
app.use(express.json())


app.use('/', userRoutes);

export default app
