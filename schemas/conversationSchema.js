const mongoose = require("mongoose")
const Schema = mongoose.Schema

const conversationSchema = new Schema({
    participants: {
        type: Array,
        required: true,
        default: [],
    },
    startDate: {
        type: Number,
        required: true,
        default: Date.now()
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
                type: Number,
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
            }
        }
    ]
})

const chat = mongoose.model("conversation", conversationSchema);

module.exports = chat;