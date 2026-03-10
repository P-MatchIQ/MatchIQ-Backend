import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import authRoutes from './modules/auth/auth.routes.js'
import candidateRoutes from './modules/cadidate/candidate.routes.js';
import offerRoutes from './modules/offers/offers.routes.js';
import companyRoutes from './modules/company/company.routes.js';


const app = express()

// ✅ Parsear orígenes permitidos desde variables de entorno
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(url => url.trim())
  : ['http://localhost:3000'];

const allowedMethods = process.env.ALLOWED_METHODS 
  ? process.env.ALLOWED_METHODS.split(',').map(method => method.trim())
  : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

const allowedHeaders = process.env.ALLOWED_HEADERS 
  ? process.env.ALLOWED_HEADERS.split(',').map(header => header.trim())
  : ['Content-Type', 'Authorization'];

// ✅ Middlewares globales PRIMERO
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: allowedMethods,
  allowedHeaders: allowedHeaders
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());      // ← Parsear cookies antes de las rutas

// Rutas DESPUÉS
app.use('/auth', authRoutes);
app.use('/candidate', candidateRoutes);
app.use('/offers', offerRoutes);
app.use('/company', companyRoutes);
export default app;