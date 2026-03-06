import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import authRoutes from './modules/auth/auth.routes.js'
import candidateRoutes from './modules/cadidate/candidate.routes.js';
import offerRoutes from './modules/offers/offers.routes.js';
import companyRoutes from './modules/company/company.routes.js';


const app = express()

// ✅ Middlewares globales PRIMERO
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());      // ← debe estar aquí antes de las rutas

// Rutas DESPUÉS
app.use('/auth', authRoutes);
app.use('/candidate', candidateRoutes);
app.use('/offers', offerRoutes);
app.use('/company', companyRoutes);
export default app;