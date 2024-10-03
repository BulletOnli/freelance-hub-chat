import asyncHandler from "express-async-handler";
import User from "../models/user.model";
import Message from "../models/message.model";
import Conversation from "../models/conversation.model";

const findOrCreateUser = async (userId: string, email: string) => {
  return await User.findOneAndUpdate(
    { userId },
    { $setOnInsert: { email } },
    { new: true, upsert: true, select: "_id", lean: true }
  );
};

export const sendMessage = asyncHandler(async (req, res) => {
  const {
    senderId,
    senderEmail,
    receiverId,
    receiverEmail,
    conversationKey,
    content,
  } = req.body;

  const receiver = await findOrCreateUser(receiverId, receiverEmail);
  const sender = await findOrCreateUser(senderId, senderEmail);

  let conversation = await Conversation.findOneAndUpdate(
    { conversationKey },
    { $setOnInsert: { participants: [sender?._id, receiver?._id] } },
    { new: true, upsert: true, select: "_id", lean: true }
  );

  const message = await Message.create({
    sender: sender?._id,
    content,
    conversation: conversation?._id,
  });

  res.status(200).json({
    senderId,
    conversationKey,
    content: message.content,
    createdAt: message.createdAt,
  });
});

export const getAllMessages = asyncHandler(async (req, res) => {
  const { receiverId, senderId } = req.query;
  const receiver = await User.findOne({ userId: receiverId });
  const sender = await User.findOne({ userId: senderId });

  const conversation = await Conversation.findOne({
    participants: { $all: [receiver?._id, sender?._id] },
  });

  const messages = await Message.find({
    conversation: conversation?._id,
  }).populate({
    path: "sender",
    select: ["userId", "email"],
  });

  res.status(200).json(messages);
});
