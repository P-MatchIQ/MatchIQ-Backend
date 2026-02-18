import { Router } from 'express'
import { login, logout, recoverPassword, refresh } from './auth.controller.js'

const router = Router()

router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.post('/recover', recoverPassword)

export default router
