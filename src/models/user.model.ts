import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // userId = Primary key (id) for the user in the main database
    userId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export type User = mongoose.InferSchemaType<typeof userSchema>;

export default mongoose.model<User>("User", userSchema);
