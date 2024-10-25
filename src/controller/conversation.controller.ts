import asyncHandler from "express-async-handler";
import Conversation from "../models/conversation.model";
import { findOrCreateUser } from "./user.controller";
import User from "../models/user.model";

export const createConversation = asyncHandler(async (req, res) => {
  const { receiverId, senderId } = req.body;

  const receiver = await findOrCreateUser(receiverId);
  const sender = await findOrCreateUser(senderId);

  if (!receiver || !sender) {
    throw new Error("Invalid user ID");
  }

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
      populate: { path: "participants", select: "userId" },
    }
  );

  res.status(201).json(conversation);
});

export const getAllConversations = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findOne({ userId }).select("_id");

  if (!user) {
    throw new Error("User not found");
  }

  const conversations = await Conversation.find({
    participants: user?._id,
  })
    .populate({
      path: "participants",
      select: "userId",
    })
    .select({
      participants: 1,
    });

  const filteredConversations = conversations.map((conversation) => {
    const otherParticipants = conversation.participants.filter(
      (participant) => !participant._id.equals(user._id)
    );

    return {
      ...conversation.toObject(),
      receiver: otherParticipants[0],
    };
  });

  res.status(200).json(filteredConversations);
});
