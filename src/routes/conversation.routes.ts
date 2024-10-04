import express from "express";
import {
  createConversation,
  getAllConversations,
} from "../controller/conversation.controller";

const router = express.Router();

router.post("/create", createConversation);
router.get("/all/:userId", getAllConversations);

export default router;
