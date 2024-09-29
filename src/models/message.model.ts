import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    chat: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export type Message = mongoose.InferSchemaType<typeof messageSchema>;

export default mongoose.model<Message>("Message", messageSchema);
