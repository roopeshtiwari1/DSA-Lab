import express from "express"
import { checkAuth, login, logout, register } from "../controller/auth.controller.js"


const authRoutes = express.Router()

authRoutes.post('/register', register)
authRoutes.post('/login', login)
authRoutes.post('/logout', logout)
authRoutes.get('/check', checkAuth)


export default authRoutes