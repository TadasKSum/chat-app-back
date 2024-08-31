const express = require('express');
const app = express();
const cors = require("cors")
const mainRouter = require('./routers/mainRouter')
const mongoose = require('mongoose');
require("dotenv").config()
// uid
const {uid} = require('uid/secure')
// Socket imports
const { createServer } = require("http");
const { Server } = require("socket.io")
// User database access
const User = require('./schemas/userSchema')
const res = require("express/lib/response");

const PORT = 2000

mongoose.connect(process.env.MONGO_KEY)
    .then(() => {
        console.log("Success")
    }).catch(err => {
    console.log("Error")
    console.log(err)
})

// Socket IO config
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
    }
});

// Express config
app.use(cors())
app.use(express.json())
app.use("/", mainRouter)

// socket.io
let users = [];
let messages = [];

// middleware
io.use(async (socket, next) => {
    const userId = socket.handshake.auth.userId;
    // Check request
    if (!userId) {
        return console.error("Bad socket request.")
    }
    // Check array
    const findThis = users.find(obj => obj.userId === userId)
    if (findThis !== undefined) {
        return console.error("This user already in chat.")
    }
    // Check database
    const user = await User.findOne({_id: userId})
    if (!user) {
        return console.error({ success: false, message: 'This user does not exist' });
    }
    // Assign socket values from database
    socket.userId = userId;
    socket.username = user.username;
    socket.picture = user.picture;
    socket.status = "Online";
    next();
})
// sockets
io.on("connection", async (socket) => {
    // socket login start
    console.log("User connected: "+socket.username)
    let currentUsers = []
    for (let [id, socket] of io.of("/").sockets) {
        currentUsers.push({
            socketId: id,
            userId: socket.userId,
            username: socket.username,
            picture: socket.picture,
            status: socket.status,
        });
    }
    users = currentUsers;
    io.local.emit("users", currentUsers)
    io.local.emit("message", messages)
    // socket login end

    // Socket events
    socket.on("message", (newChat) => {
        newChat.id = uid(16)
        newChat.likes = []
        messages.push(newChat)
        io.emit("message", messages)
    })

    // Likes handle
    socket.on("like", (like) => {
        let index = messages.findIndex(obj => obj.id === like.id)
        let findThis = messages.find(obj => obj.id === like.id)
        // Check
        if (findThis.sender === like.like) return
        if (findThis.likes.includes(like.like)) return
        findThis.likes.push(like.like)
        messages[index] = findThis
        io.emit("message", messages)
    })

    // Disconnect
    socket.on('disconnect', () => {
        console.log("User disconnected: "+socket.username)
        currentUsers = currentUsers.filter(obj => obj.userId !== socket.userId);
        users = currentUsers;
        socket.broadcast.emit("users", currentUsers);
    })
});

httpServer.listen(PORT, () => {
    console.log("Server connected to port: "+PORT)
});