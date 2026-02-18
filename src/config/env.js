import dotenv from 'dotenv'
dotenv.config()

export const env = {
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  DB_URL: process.env.DB_URL,
  TOKEN_EXPIRES: process.env.TOKEN_EXPIRES || '15m',
  REFRESH_EXPIRES: process.env.REFRESH_EXPIRES || '7d',
  DB_SCHEMA: process.env.DB_SCHEMA || 'public'
}
