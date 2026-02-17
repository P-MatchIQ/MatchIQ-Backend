import pkg from 'pg';
import { env } from './env.js';

const { Pool } = pkg;

export const db = new Pool({
  connectionString: env.DB_URL
});

// Verificar conexión simple
export const testConnection = async () => {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('Conexión exitosa a PostgreSQL');
    console.log('Hora del servidor:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Error de conexión:', error.message);
    return false;
  }
};