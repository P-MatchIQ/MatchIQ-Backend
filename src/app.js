import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import authRoutes from './modules/auth/auth.routes.js'
import candidateRoutes from './modules/cadidate/candidate.routes.js';
import offerRoutes from './modules/offers/offers.routes.js';

const app = express()

// ✅ Middlewares globales PRIMERO
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true  // ← Permitir cookies
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());      // ← Parsear cookies antes de las rutas

// Rutas DESPUÉS
app.use('/auth', authRoutes);
app.use('/candidate', candidateRoutes);
app.use('/offers', offerRoutes);
export default app;