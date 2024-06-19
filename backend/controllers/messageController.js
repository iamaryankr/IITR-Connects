import { v2 as cloudinary } from "cloudinary";
import { getRecipientSocketId, io } from "../socket/socket.js";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { errorHandler } from "../utils/errorHandler.js";

export const sendMessage = errorHandler(async (req, res) => {
	const { recipientId, message } = req.body;
	let { img } = req.body;
	const senderId = req.user._id;

	let conversation = await Conversation.findOne({
		participants: { $all: [senderId, recipientId] },
	});

	if (!conversation) {
		conversation = new Conversation({
			participants: [senderId, recipientId],
			lastMessage: {
				text: message,
				sender: senderId,
			},
		});
		await conversation.save();
	}

	if (img) {
		const uploadedResponse = await cloudinary.uploader.upload(img);
		img = uploadedResponse.secure_url;
	}

	const newMessage = new Message({
		conversationId: conversation._id,
		sender: senderId,
		text: message,
		img: img || "",
	});

	await Promise.all([
		newMessage.save(),
		conversation.updateOne({
			lastMessage: {
				text: message,
				sender: senderId,
			},
		}),
	]);

	const recipientSocketId = getRecipientSocketId(recipientId);
	if (recipientSocketId) {
		io.to(recipientSocketId).emit("newMessage", newMessage);
	}

	res.status(201).json(newMessage);
});

export const getMessages = errorHandler(async (req, res) => {
	const { otherUserId } = req.params;
	const userId = req.user._id;
	const conversation = await Conversation.findOne({
		participants: { $all: [userId, otherUserId] },
	});

	if (!conversation) {
		return res.status(404).json({ error: "Conversation not found" });
	}

	const messages = await Message.find({
		conversationId: conversation._id,
	}).sort({ createdAt: 1 });

	res.status(200).json(messages);
});

export const getConversations = errorHandler(async (req, res) => {
	const userId = req.user._id;
	const conversations = await Conversation.find({ participants: userId }).populate({
		path: "participants",
		select: "username profilePic",
	});

	// remove the current user from the participants array
	conversations.forEach((conversation) => {
		conversation.participants = conversation.participants.filter(
			(participant) => participant._id.toString() !== userId.toString()
		);
	});
	res.status(200).json(conversations);
});