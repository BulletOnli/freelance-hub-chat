import asyncHandler from "express-async-handler";
import Conversation from "../models/conversation.model";
import User from "../models/user.model";

const findOrCreateUser = async (userId: string) => {
  return await User.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true, select: "_id", lean: true }
  );
};

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

  const conversations = await Conversation.find({
    participants: { $all: [userId] },
  }).populate("participants");

  res.status(200).json(conversations);
});
