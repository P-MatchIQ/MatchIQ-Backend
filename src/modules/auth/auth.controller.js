import { validateRegister } from './auth.validation.js';
import { authService } from './auth.service.js';

async function registerCandidate(req, res) {
  try {
    const { email, password, confirmPassword } = req.body;

    validateRegister({ email, password, confirmPassword });

    const result = await authService.register({
      email,
      password,
      role: 'candidate'
    });

    return res.status(201).json(result);

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function registerCompany(req, res) {
  try {
    const { email, password, confirmPassword } = req.body;

    validateRegister({ email, password, confirmPassword });

    const result = await authService.register({
      email,
      password,
      role: 'company'
    });

    return res.status(201).json(result);

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

/**
 * Login - Crea cookie HTTP-only con JWT
 */
async function login(req, res) {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      throw new Error('Email y password son obligatorios');
    }

    // Obtener token del servicio
    const { token, user } = await authService.login({ email, password });

    // ✅ Crear cookie HTTP-only con duración según rememberMe
    const maxAge = rememberMe 
      ? 30 * 24 * 60 * 60 * 1000  // 30 días
      : 24 * 60 * 60 * 1000;       // 24 horas

    res.cookie('token', token, {
      httpOnly: true,        // 🔒 No accesible desde JavaScript
      secure: process.env.NODE_ENV === 'production',  // Solo HTTPS en prod
      sameSite: 'strict',    // 🛡️ Protege contra CSRF
      maxAge: maxAge
    });

    // Responder con datos del usuario (sin el token en la respuesta)
    return res.status(200).json({ 
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return res.status(401).json({ 
      code: 'INVALID_CREDENTIALS',
      message: error.message
    });
  }
}

/**
 * Logout - Limpia la cookie del token
 */
async function logout(req, res) {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.status(200).json({ 
      ok: true,
      message: 'Sesión cerrada exitosamente'
    });

  } catch (error) {
    return res.status(400).json({ 
      code: 'LOGOUT_FAILED',
      message: error.message
    });
  }
}

/**
 * Me - Verifica sesión activa
 * Devuelve el usuario autenticado si hay sesión válida
 */
async function me(req, res) {
  try {
    // Si el middleware authenticate pasó, req.user tiene el payload del JWT
    if (!req.user) {
      return res.status(200).json({
        authenticated: false,
        user: null
      });
    }

    // Obtener datos completos del usuario desde BD
    const user = await authService.getUserById(req.user.id);

    if (!user) {
      return res.status(200).json({
        authenticated: false,
        user: null
      });
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    // En caso de error, responder como no autenticado (sin arrojar error)
    return res.status(200).json({
      authenticated: false,
      user: null
    });
  }
}

/**
 * Check Me - Versión pública (sin autenticación requerida)
 * Se usa para verificar sesión en cada carga de app
 */
async function checkMe(req, res) {
  try {
    const { verifyAccessToken } = await import('../../utils/jwt.js');
    
    const tokenFromCookie = req.cookies?.token;

    // Si no hay token, no hay sesión
    if (!tokenFromCookie) {
      return res.status(200).json({
        authenticated: false,
        user: null
      });
    }

    // Verificar token
    const payload = verifyAccessToken(tokenFromCookie);

    // Obtener datos del usuario
    const user = await authService.getUserById(payload.id);

    if (!user) {
      return res.status(200).json({
        authenticated: false,
        user: null
      });
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    // Token inválido o expirado
    return res.status(200).json({
      authenticated: false,
      user: null
    });
  }
}


export const authController = {
  registerCandidate,
  registerCompany,
  login,
  logout,
  me,
  checkMe
};