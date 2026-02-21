import pool from '../../config/db.js';
import { hashPassword } from '../../utils/hash.js';
import { generateAccessToken } from '../../utils/jwt.js';
import bcrypt from 'bcrypt';

async function register({ email, password, role }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1️⃣ Verificar si el email ya existe
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('El email ya está registrado');
    }

    // 2️⃣ Hashear contraseña
    const passwordHash = await hashPassword(password);

    // 3️⃣ Crear usuario
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, role`,
      [email, passwordHash, role]
    );

    const user = userResult.rows[0];

    // 4️⃣ Crear perfil vacío según rol
    if (role === 'candidate') {
      await client.query(
        'INSERT INTO candidate_profiles (user_id) VALUES ($1)',
        [user.id]
      );
    }

    if (role === 'company') {
      await client.query(
        'INSERT INTO company_profiles (user_id) VALUES ($1)',
        [user.id]
      );
    }

    await client.query('COMMIT');

    // 5️⃣ Generar token automáticamente (queda logueado)
    const token = generateAccessToken({
      id: user.id,
      role: user.role
    });

    return { token };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function login({ email, password }) {
  const userResult = await pool.query(
    'SELECT id, email, password_hash, role FROM users WHERE email = $1',
    [email]
  );

  if (userResult.rows.length === 0) {
    throw new Error('Credenciales inválidas');
  }

  const user = userResult.rows[0];

  const isMatch = await bcrypt.compare(password, user.password_hash)

  if (!isMatch) {
    throw new Error('Credenciales inválidas')
  }

  const token = generateAccessToken({
    id: user.id,
    role: user.role
  })

  return { token }
}

export const authService = {
  register,
  login
}