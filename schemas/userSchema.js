const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    created: {
        type: Number,
        required: true,
        default: Date.now()
    },
    description: {
        type: String,
        required: false,
        default: "No description",
    },
    tags: {
        type: Array,
        required: false,
        default: []
    }
})

const user = mongoose.model("users", userSchema);

module.exports = user;