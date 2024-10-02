import asyncHandler from "express-async-handler";
import User from "../models/user.model";
import Message from "../models/message.model";
import Conversation from "../models/conversation.model";

export const sendMessage = asyncHandler(async (req, res) => {
  const { senderId, senderEmail, conversationKey, content } = req.body;

  if (!conversationKey) throw new Error("Conversation ID is required");

  let sender = await User.findOneAndUpdate(
    { userId: senderId },
    { $setOnInsert: { email: senderEmail } },
    { new: true, upsert: true, select: "_id", lean: true }
  );

  let conversation = await Conversation.findOneAndUpdate(
    { conversationKey },
    { $setOnInsert: { participants: [sender?._id] } },
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
