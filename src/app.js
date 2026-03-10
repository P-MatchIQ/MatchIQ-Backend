import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import authRoutes from './modules/auth/auth.routes.js'
import candidateRoutes from './modules/cadidate/candidate.routes.js';
import offerRoutes from './modules/offers/offers.routes.js';
import dotenv from 'dotenv'

dotenv.config()

const app = express()

const allowedMethods = process.env.ALLOWED_METHODS 
  ? process.env.ALLOWED_METHODS.split(',').map(method => method.trim())
  : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

const allowedHeaders = process.env.ALLOWED_HEADERS 
  ? process.env.ALLOWED_HEADERS.split(',').map(header => header.trim())
  : ['Content-Type', 'Authorization'];

// ✅ Middlewares globales PRIMERO
app.use(cors({
  origin: function(origin, callback) {

    const allowedOrigins = [
      "http://localhost:3000",
      "http://127.0.0.1:5501",
      "http://localhost:5501"
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }

  },
  credentials: true
}));


app.options('/', cors());

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Rutas DESPUÉS
app.use('/auth', authRoutes);
app.use('/candidate', candidateRoutes);
app.use('/offers', offerRoutes);
export default app;