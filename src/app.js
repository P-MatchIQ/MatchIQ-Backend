import express from 'express'
import authRoutes from './modules/auth/auth.routes.js'
import { testConnection } from './config/db.js'
import { env } from './config/env.js'

const app = express()

app.use(express.json())

const startServer = async () => {
  await testConnection()

  app.listen(env.PORT, () => {
    console.log(`Servidor en puerto ${env.PORT}`)
  })
  app.use('/auth', authRoutes)
}

startServer()

export default app
