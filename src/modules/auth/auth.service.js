import pool from '../../config/db.js';
import { hashPassword } from '../../utils/hash.js';
import { generateAccessToken } from '../../utils/jwt.js';
import bcrypt from 'bcrypt';
import { sendPasswordResetEmail } from '../../utils/emails.js';
import crypto from 'crypto';

async function register({ email, password, role }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('El email ya está registrado');
    }

    const passwordHash = await hashPassword(password);

    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, role`,
      [email, passwordHash, role]
    );

    const user = userResult.rows[0];

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
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = generateAccessToken({
        id: null,
        email,
        role: 'admin'
      });
      return {
        token,
        user: { id: null, email, role: 'admin' }
      };
    }
    throw new Error('Credenciales inválidas');
  }

  const user = userResult.rows[0];

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new Error('Credenciales inválidas');
  }

  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  return {
    token,
    user: { id: user.id, email: user.email, role: user.role }
  };
}

async function getUserById(userId) {
  const userResult = await pool.query(
    'SELECT id, email, role FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) return null;

  return userResult.rows[0];
}

async function forgotPassword({ email }) {
  const result = await pool.query(
    'SELECT id, email FROM users WHERE email = $1 AND is_active = true',
    [email]
  );

  if (!result.rows.length) return { ok: true };

  const user = result.rows[0];

  await pool.query(
    'UPDATE password_resets SET used = true WHERE user_id = $1 AND used = false',
    [user.id]
  );

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  await pool.query(
    `INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [user.id, token, expiresAt]
  );

  const resetUrl = `${process.env.FRONTEND_URL}/public/resetPassword.html?token=${token}`;
  await sendPasswordResetEmail({ to: user.email, resetUrl });

  return { ok: true };
}

async function resetPassword({ token, newPassword }) {
  const result = await pool.query(
    `SELECT pr.*, u.email FROM password_resets pr
     JOIN users u ON u.id = pr.user_id
     WHERE pr.token = $1
       AND pr.used = false
       AND pr.expires_at > NOW()`,
    [token]
  );

  if (!result.rows.length) {
    throw new Error('El enlace es inválido o ha expirado.');
  }

  const reset = result.rows[0];
  const hashedPassword = await hashPassword(newPassword);

  await pool.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [hashedPassword, reset.user_id]
  );

  await pool.query(
    'UPDATE password_resets SET used = true WHERE id = $1',
    [reset.id]
  );

  return { ok: true };
}

async function loginWithGoogle({ googleId, email, firstName, lastName, role = 'candidate' }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [email]
    );

    // Ya existe → login, no cambia su rol
    if (existing.rows.length > 0) {
      await client.query('COMMIT');
      return existing.rows[0];
    }

    // No existe → crear con el rol que viene del formulario
    const newUser = await client.query(
      `INSERT INTO users (email, password_hash, role, is_active)
       VALUES ($1, NULL, $2, true)
       RETURNING id, email, role`,
      [email, role]
    );

    const user = newUser.rows[0];

    if (role === 'candidate') {
      await client.query(
        `INSERT INTO candidate_profiles (user_id, first_name, last_name)
         VALUES ($1, $2, $3)`,
        [user.id, firstName, lastName]
      );
    } else if (role === 'company') {
      await client.query(
        `INSERT INTO company_profiles (user_id) VALUES ($1)`,
        [user.id]
      );
    }

    await client.query('COMMIT');
    return user;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export const authService = {
  register,
  login,
  getUserById,
  forgotPassword,
  resetPassword,
  loginWithGoogle,
};