import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../config/db.js';
import { env } from '../../config/env.js';

export const authService = {

  async login(email, password) {
    const userRes = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userRes.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = userRes.rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error('Invalid credentials');

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.TOKEN_EXPIRES }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.REFRESH_EXPIRES }
    );

    // guardar refresh token
    await db.query(
      'INSERT INTO refresh_tokens(user_id, token) VALUES ($1,$2)',
      [user.id, refreshToken]
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        role: user.role,
        email: user.email
      }
    };
  },

  async refresh(oldRefreshToken) {
    const tokenRes = await db.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = false',
      [oldRefreshToken]
    );

    if (tokenRes.rows.length === 0) {
      throw new Error('Invalid refresh token');
    }

    let payload;
    try {
      payload = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw new Error('Expired refresh token');
    }

    // rotación: revocar token viejo
    await db.query(
      'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
      [oldRefreshToken]
    );

    const newAccessToken = jwt.sign(
      { id: payload.id },
      env.JWT_SECRET,
      { expiresIn: env.TOKEN_EXPIRES }
    );

    const newRefreshToken = jwt.sign(
      { id: payload.id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.REFRESH_EXPIRES }
    );

    await db.query(
      'INSERT INTO refresh_tokens(user_id, token) VALUES ($1,$2)',
      [payload.id, newRefreshToken]
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  },

  async logout(refreshToken) {
    await db.query(
      'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
      [refreshToken]
    );
  },

  async recover(email) {
    const userRes = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userRes.rows.length === 0) return;

    const token = jwt.sign(
      { email },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // aquí iría servicio real de email
    console.log(`Recovery token: ${token}`);
  }
};
