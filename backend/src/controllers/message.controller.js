import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiveSocketId, io } from '../lib/socket.js';


//function to get all the users that chat with you on the left hand side pannel
export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filterredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(filterredUsers)
    } catch (error) {
        console.log("Error in Showing Users Sidebar", error.message)
        res.status(500).json({ message: "Internal server error" });
    }
};

//function to get messages and chats between you and specific other user
export const getMessages = async (req, res) => {
    try {
        const { id: userToChat } = req.params
        const myId = req.user._id;
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChat },
                { senderId: userToChat, receiverId: myId }
            ]
        })
        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in Showing Messages", error.message)
        res.status(500).json({ message: "Internal server error" });
    }
};

//function to send message
export const sendMessage = async (req, res) => {
    try {
        const { text,image } = req.body;
        const {id: receiverId } = req.params
        const senderId = req.user._id;

        //check if user is sending image in the chat 
        let imageUrl;
        if(image){
            //upload image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        //get senderId, receiverId, text, and image uploaded on cloudinary
        const newMessage = new Message({
            senderId, receiverId, text, image: imageUrl
        });

        await newMessage.save();

        const receiverSocketId = getReceiveSocketId(receiverId);
        if(receiverSocketId){
            //send message to receiver
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in Showing Messages", error.message)
        res.status(500).json({ message: "Internal server error" });
    }
}