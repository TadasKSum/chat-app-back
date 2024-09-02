const express = require('express')
const Router = express.Router()
const {registerValid, loginValid, changePassValid} = require('../middleware/vallidator')
const {tokenValid} = require('../middleware/authentication')
const {
    register,
    login,
    autoLogin,
    changePicture,
    changePassword,
    getAllUsers,
    getSingleUser,
    startConversation,
    deleteConversation,
    makeMessage,
    getUserConversations,
    getSingleTalk,
    addDescription,
    addTag
} = require('../controllers/mainControl')

// New User
Router.post("/register", registerValid, register)
Router.post("/login", loginValid, login)
// Auto-login using cookie
Router.post("/auto-login", tokenValid, autoLogin)
// User profile actions
Router.post("/change-picture", tokenValid, changePicture)
Router.post("/change-password", tokenValid, changePassValid, changePassword)
// All users
Router.get("/all-users", getAllUsers)
// Single user
Router.get("/single-user/:userId", getSingleUser)
// Conversation actions
Router.post("/start-conversation", tokenValid, startConversation)
Router.post("/delete-conversation", tokenValid, deleteConversation)
Router.post("/make-message", tokenValid, makeMessage)
Router.post("/get-conversations", tokenValid, getUserConversations)
Router.get("/get-single-talk/:chatId", tokenValid, getSingleTalk)
// Additional user actions
Router.post("/add-description", tokenValid, addDescription)
Router.post("/add-tag", tokenValid, addTag)

module.exports = Router