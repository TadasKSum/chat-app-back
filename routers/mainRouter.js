const express = require('express')
const Router = express.Router()
const {registerValid, loginValid, changePassValid} = require('../middleware/vallidator')
const {tokenValid} = require('../middleware/authentication')
const {register, login, autoLogin, changePicture, changePassword} = require('../controllers/mainControl')

Router.post("/register", registerValid, register)
Router.post("/login", loginValid, login)
Router.post("/auto-login", tokenValid, autoLogin)
Router.post("/change-picture", tokenValid, changePicture)
Router.post("/change-password", tokenValid, changePassValid, changePassword)

module.exports = Router