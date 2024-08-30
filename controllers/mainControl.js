const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const User = require('../schemas/userSchema')
const Chat = require('../schemas/conversationSchema')

module.exports = {
    register: async (req, res) => {
        const {username, nickname, passOne} = req.body;
        try {
            // Check if user exists
            const existingUser = await User.findOne({ username: username });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'User with this username already exists.' });
            }
            // Encode password
            const salt = await bcrypt.genSalt(10);
            const passHash = await bcrypt.hash(passOne, salt);
            // Create new user
            const newUser = new User({
                username,
                nickname,
                password: passHash,
                picture: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
            });
            // Save new user
            await newUser.save();
            // Send response
            return res.status(201).json({ success: true, message: 'User successfully created!' });
        } catch (error) {
            console.error("Error (mainControl > register): ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    login: async (req, res) => {
        const {username, password} = req.body;
        try {
            // Find user
            const user = await User.findOne({ username: username });
            if (!user) {
                return res.status(404).json({ success: false, message: 'This user does not exist' });
            }
            // Check password
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(404).json({ success: false, message: 'Wrong password' });
            }
            // Send login info
            const token = jwt.sign({userId: user._id}, process.env.JWT_KEY)

            const data = {
                id: user._id,
                username: user.username,
                nickname: user.nickname,
                picture: user.picture,
            }

            return res.status(200).json({success: true, token, data, message: 'Successfully logged in!'});

        } catch (error) {
            console.error("Error (mainControl > login): ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    autoLogin: async (req, res) => {
        const {userId} = req.user;
        try {
            const user = await User.findOne({ _id: userId });
            if (!user) {
                return res.status(404).json({ success: false, message: 'This user does not exist' });
            }
            const token = jwt.sign({userId: user._id}, process.env.JWT_KEY)
            const data = {
                id: user._id,
                username: user.username,
                nickname: user.nickname,
                picture: user.picture,
            }
            return res.status(200).json({success: true, token, data, message: 'Successfully logged in!'});
        } catch (error) {
            console.error("Error (mainControl > autoLogin): ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    changePicture: async (req, res) => {
        const {userId} = req.user;
        const {picture} = req.body;
        try {
            // Check if user exists
            const user = await User.findOne({ _id: userId });
            if (!user) {
                return res.status(404).json({ success: false, message: 'This user does not exist' });
            }
            // Find and update, return new
            const updatedUser = await User.findOneAndUpdate({_id: userId}, {$set: {picture}}, {new: true})
            // Send new picture only
            return res.status(200).json({success: true, message: 'Successfully changed picture', data:{picture: updatedUser.picture}});
        } catch (error) {
            console.error("Error (mainControl > changePicture): ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    changePassword: async (req, res) => {
        const {userId} = req.user;
        const {passOne} = req.body
        try {
            // find User
            const user = await User.findOne({ _id: userId });
            if (!user) {
                return res.status(404).json({ success: false, message: 'This user does not exist' });
            }
            // encode password
            const salt = await bcrypt.genSalt(10);
            const passHash = await bcrypt.hash(passOne, salt);
            // update user
            await User.findOneAndUpdate({_id: userId}, {password: passHash});
            // send response
            return res.status(200).json({success: true, message: 'Successfully changed password'});
        } catch (error) {
            console.error("Error (mainControl > changePassword): ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const data = await User.find({}, {password: 0});
            return res.status(200).json({success: true, data, message: "Successfully fetched users"});
        } catch (error) {
            console.error("Error (mainControl > getAllUsers): ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    getSingleUser: async (req, res) => {
        try {
            const {userId} = req.params
            const user = await User.findOne({_id: userId}, {password: 0})
            if(!user) {
                return res.status(404).json({ success: false, message: 'This user does not exist' });
            }
            return res.status(200).json({success: true, data: user, message: "Successfully fetched single user"});
        } catch (error) {
            console.error("Error (mainControl > getSingleUser): ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    startConversation: async (req, res) => {
        const {userId} = req.user;
        const {participant} = req.body;
        try {
            // Find user
            const user = await User.findOne({_id: userId});
            if (!user) {
                return res.status(404).json({ success: false, message: 'This user does not exist' });
            }
            // Find participant
            const chatter = await User.findOne({_id: participant});
            if (!chatter) {
                return res.status(404).json({ success: false, message: 'User you want to talk with does not exist' });
            }
            // Check if conversation already exists
            const existCheck = await Chat.find({
                $and:
                    [
                        {participants: {$elemMatch: {id: user._id}}},
                        {participants: {$elemMatch: {id: chatter._id}}}
                    ]
            })
            /*const existCheck = await Chat.find({participants: {$all: [user._id, chatter._id]}})*/
            if (existCheck.length !== 0) {
                return res.status(404).json({ success: false, message: 'Conversation between these users already exists' });
            }
            // Register new conversation
            const newChat = new Chat({
                participants: [
                    {
                        id: user._id,
                        name: user.username,
                        avatar: user.picture,
                    },
                    {
                        id: chatter._id,
                        name: chatter.username,
                        avatar: chatter.picture,
                    }
                ],
                messages: []
            })
            await newChat.save()
            // Fetch all user conversations
            const conversations = await Chat.find({participants: {$elemMatch: {id: user._id} }})
            // Send conversation to front
            return res.status(200).json({success: true, data: conversations});
        } catch (error) {
            console.error("Error (mainControl > startConversation): ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    deleteConversation: async (req,res) => {
        const {userId} = req.user;
        const {chatId, request} = req.body;
        try {
            if (request !== "delete ThIs") {
                return res.status(404).json({ success: false, message: 'Bad request' });
            }
            // Check user
            const user = await User.findOne({_id: userId});
            if (!user) {
                return res.status(404).json({ success: false, message: 'This user does not exist' });
            }
            // Check conversation
            const conversation = await Chat.findOne({_id: chatId});
            if (!conversation) {
                return res.status(404).json({ success: false, message: 'Conversation does not exist' });
            }
            // Check if user is in conversation
            const contains = conversation.participants.some(obj => obj.name === user.username)
            if (!contains) {
                return res.status(404).json({ success: false, message: 'This user is not participant of this conversation' });
            }
            // Delete
            await Chat.findOneAndDelete({_id: chatId})
            const data = await Chat.find({participants: {$elemMatch: {id: userId}}})
            return res.status(200).json({success: true, message: "Successfully deleted conversation", data});
        } catch (error) {
            console.error("Error (mainControl > deleteConversation): ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    makeMessage: async (req, res) => {
        const {userId} = req.user;
        const {chatId, time, content, sender, avatar} = req.body;
        if (!chatId || !time || !content || !sender || !avatar) {
            return res.status(400).json({ success: false, message: 'Bad request' });
        }
        try {
            // Find user
            const user = await User.findOne({_id: userId});
            if (!user) {
                return res.status(404).json({ success: false, message: 'This user does not exist' });
            }
            // Find conversation
            const conversation = await Chat.findOne({_id: chatId});
            if (!conversation) {
                return res.status(404).json({ success: false, message: 'Conversation does not exist' });
            }
            // Create new message
            let newMessage = {
                senderId: userId,
                time,
                content,
                sender,
                avatar
            }
            // Update
            const updatedChat = await Chat.findOneAndUpdate(
                {_id: chatId},
                {$push: {messages: newMessage}},
                {new: true}
            );
            return res.status(200).json({success: true, data: updatedChat});
        } catch (error) {
            console.error("Error (mainControl > makeMessage): ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    getUserConversations: async (req, res) => {
        const {userId} = req.user;
        const {request} = req.body;
        try {
            if (request !== "fetch me these") {
                return res.status(404).json({ success: false, message: 'Bad request' });
            }
            // Find user
            const user = await User.findOne({_id: userId});
            if (!user) {
                return res.status(404).json({ success: false, message: 'This user does not exist' });
            }
            // Find conversations
            const data = await Chat.find({participants: {$elemMatch: {id: user._id}}})
            return res.status(200).json({success: true, data});
        } catch (error) {
            console.error("Error (mainControl > getUserConversations): ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    getSingleTalk: async (req, res) => {
        const {userId} = req.user;
        const {chatId} = req.params;
        try {
            const user = await User.findOne({_id: userId});
            if (!user) {
                return res.status(404).json({ success: false, message: 'This user does not exist' });
            }
            // Find conversation
            const conversation = await Chat.findOne({_id: chatId});
            if (!conversation) {
                return res.status(404).json({ success: false, message: 'Conversation does not exist' });
            }
            return res.status(200).json({success: true, data: conversation});
        } catch (error) {
            console.error("Error (mainControl > getSingleTalk): ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
}