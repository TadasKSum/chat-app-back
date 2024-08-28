const express = require('express');
const app = express();
const cors = require("cors")
const mainRouter = require('./routers/mainRouter')
const mongoose = require('mongoose');
require("dotenv").config()

const PORT = 2000

mongoose.connect(process.env.MONGO_KEY)
    .then(() => {
        console.log("Success")
    }).catch(err => {
    console.log("Error")
    console.log(err)
})

app.use(cors())
app.use(express.json())
app.use("/", mainRouter)

app.listen(PORT, () => {
    console.log("Server connected to port: "+PORT)
});