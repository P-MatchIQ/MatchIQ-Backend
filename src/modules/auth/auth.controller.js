import { authService } from './auth.service.js'

export async function login (req, res) {
  try {
    const { email, password } = req.body
    const data = await authService.login(email, password)
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export async function refresh (req, res) {
  try {
    const { refreshToken } = req.body
    const data = await authService.refresh(refreshToken)
    res.json(data)
  } catch (err) {
    res.status(401).json({ error: err.message })
  }
}

export async function logout (req, res) {
  try {
    const { refreshToken } = req.body
    await authService.logout(refreshToken)
    res.json({ message: 'Session closed' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export async function recoverPassword (req, res) {
  try {
    const { email } = req.body
    await authService.recover(email)
    res.json({ message: 'Recovery email sent' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}
