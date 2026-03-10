import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import authRoutes from './modules/auth/auth.routes.js'

const app = express();
// const matchingRoutes = require('./modules/matching/matching.routes');

// Middlewares globales
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use('/auth', authRoutes);
// app.use('/matching', matchingRoutes);


export default app;