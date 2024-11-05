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
    res.status(200).json([]);
    return;
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

export const deleteConversation = async (req: any, res: any) => {
  const { conversationId } = req.params;
  const { userId } = req.body;

  const result = await deleteConversationForUser(conversationId, userId);

  if (result.success) {
    res.status(200).json({ message: result.message });
  } else {
    res.status(400).json({ error: result.message });
  }
};

async function deleteConversationForUser(
  conversationId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const conversation = await Conversation.findById(conversationId);
    const user = await User.findOne({ userId });

    if (!conversation) {
      return { success: false, message: "Conversation not found" };
    }

    const isParticipant = conversation.participants.some(
      (participantId) => participantId.toString() === user?._id.toString()
    );

    if (!isParticipant) {
      return {
        success: false,
        message: "User is not a participant in this conversation",
      };
    }

    // If conversation is already deleted for user, remove user from deletedFor array
    if (conversation.isDeletedFor(userId)) {
      conversation.deletedFor = conversation.deletedFor.filter(
        (deleted) => deleted.userId !== userId
      );
      await conversation.save();
    }

    // Add user to deletedFor array
    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $push: {
          deletedFor: {
            userId: userId,
            deletedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    return { success: true, message: "Conversation deleted successfully" };
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return { success: false, message: "Error deleting conversation" };
  }
}
