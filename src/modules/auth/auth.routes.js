import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';

const router = Router();

// Rutas públicas (sin autenticación)
router.post('/register/candidate', authController.registerCandidate);
router.post('/register/company', authController.registerCompany);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword', authController.resetPassword);

// � Ruta pública para verificar sesión (sin autenticación requerida en la ruta)
// Pero lee la cookie si existe
router.get('/me', authController.checkMe);

// Rutas protegidas (requieren autenticación)
router.post('/logout', authenticate, authController.logout);

// Ruta alternativa protegida por middleware (si se prefiere)
router.get('/me-protected', authenticate, authController.me);

export default router;