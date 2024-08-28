const mongoose = require("mongoose")
const Schema = mongoose.Schema

const conversationSchema = new Schema({
    participants: {
        type: Array,
        required: true,
        default: [],
    },
    messages: [
        {
            sender: {
                type: String,
                required: true,
            },
            senderId: {
                type: String,
                required: true,
            },
            time: {
                type: String,
                required: true,
                default: Date.now()
            },
            avatar: {
                type: String,
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            likes: {
                type: Array,
                required: true,
                default: []
            }
        }
    ]
})

const chat = mongoose.model("conversation", conversationSchema);

module.exports = chat;