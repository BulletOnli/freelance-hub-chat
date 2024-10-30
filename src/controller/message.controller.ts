import asyncHandler from "express-async-handler";
import User from "../models/user.model";
import Message from "../models/message.model";
import Conversation from "../models/conversation.model";
import { findOrCreateUser } from "./user.controller";

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
  const [receiver, sender] = await Promise.all([
    User.findOne({ userId: receiverId }),
    User.findOne({ userId: senderId }),
  ]);

  if (!receiver || !sender) {
    throw new Error("Invalid user ID");
  }

  const conversation = await Conversation.findOne({
    participants: { $all: [receiver?._id, sender?._id] },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const messages = await Message.find({
    conversation: conversation?._id,
  }).populate({
    path: "sender",
    select: "userId createdAt",
  });

  if (conversation.isDeletedFor(sender?.userId)) {
    const deleteFor = conversation.deletedFor.find(
      (deleted) => deleted.userId === sender?.userId
    );

    if (!deleteFor) throw new Error("Deletion not found");

    const filteredMessages = messages.filter((message) => {
      return message.createdAt > deleteFor?.deletedAt;
    });

    res.status(200).json(filteredMessages);
  } else {
    res.status(200).json(messages);
  }
});
