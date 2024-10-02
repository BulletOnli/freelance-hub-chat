import asyncHandler from "express-async-handler";
import User from "../models/user.model";
import Message from "../models/message.model";
import Conversation from "../models/conversation.model";

export const sendMessage = asyncHandler(async (req, res) => {
  const { senderId, senderEmail, conversationId, content } = req.body;

  let sender = await User.findById(senderId).select("_id").lean();
  if (!sender) {
    sender = await User.create({ email: senderEmail, userId: senderId });
  }

  let conversation = await Conversation.findById(conversationId)
    .select("_id")
    .lean();
  if (!conversation) {
    conversation = await Conversation.create({ participants: [sender?._id] });
  }

  const message = await Message.create({
    sender: sender._id,
    content,
    conversation: conversation._id,
  });

  res.status(200).json(message);
});
