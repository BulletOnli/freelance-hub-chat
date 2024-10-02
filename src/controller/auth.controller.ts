import asyncHandler from "express-async-handler";
import userModel from "../models/user.model";

export const registerUser = asyncHandler(async (req, res) => {
  const response = await userModel.create({
    _id: "1",
    email: "test@gmail.com",
  });

  console.log(response);

  res.status(200).json({ message: "Register route" });
});
