import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export type Conversation = mongoose.InferSchemaType<typeof conversationSchema>;

export default mongoose.model<Conversation>("Conversation", conversationSchema);
