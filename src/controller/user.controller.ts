import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import userModel from "../models/user.model";

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await userModel.findOne({ userId }).lean();

  if (!user) {
    throw new Error("User not found");
  }

  res.status(200).json(user);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = await userModel.create({ userId });

  res.status(201).json(user);
});

export const findOrCreateUser = async (userId: string) => {
  return await userModel.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true, select: "_id", lean: true }
  );
};
