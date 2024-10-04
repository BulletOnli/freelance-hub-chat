import asyncHandler from "express-async-handler";
import User from "../models/user.model";
import Message from "../models/message.model";
import Conversation from "../models/conversation.model";

const findOrCreateUser = async (userId: string) => {
  return await User.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true, select: "_id", lean: true }
  );
};

export const sendMessage = asyncHandler(async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  const receiver = await findOrCreateUser(receiverId);
  const sender = await findOrCreateUser(senderId);

  const conversation = await Conversation.findOneAndUpdate(
    {
      participants: {
        $all: [
          { $elemMatch: { $eq: receiver?._id } },
          { $elemMatch: { $eq: sender?._id } },
        ],
      },
    },
    { $setOnInsert: { participants: [receiver?._id, sender?._id] } },
    {
      new: true,
      upsert: true,
      lean: true,
      select: "_id",
    }
  );

  const message = await Message.create({
    sender: sender?._id,
    content,
    conversation: conversation?._id,
  });

  res.status(200).json({
    sender: {
      userId: senderId,
    },
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
    select: "userId",
  });

  res.status(200).json(messages);
});
