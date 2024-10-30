import mongoose, { Document, Model } from "mongoose";

type IDeletedFor = {
  userId: String;
  deletedAt: Date;
};

type IConversation = {
  participants: mongoose.Types.ObjectId[];
  deletedFor: IDeletedFor[];
  createdAt: Date;
  updatedAt: Date;
};

type IConversationMethods = {
  isDeletedFor(userId: string): boolean;
};

export type Conversation = Model<IConversation, {}, IConversationMethods>;

const conversationSchema = new mongoose.Schema<
  IConversation,
  Conversation,
  IConversationMethods
>(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    deletedFor: [
      {
        userId: {
          type: String,
        },
        deletedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

conversationSchema.methods.isDeletedFor = function (userId: string): boolean {
  return this.deletedFor.some((deletion) => deletion.userId === userId);
};

// export type Conversation = mongoose.InferSchemaType<typeof conversationSchema>;

export default mongoose.model<IConversation, Conversation>(
  "Conversation",
  conversationSchema
);
