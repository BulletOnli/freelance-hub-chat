import express from "express";
import {
  createConversation,
  deleteConversation,
  getAllConversations,
} from "../controller/conversation.controller";

const router = express.Router();

router.post("/create", createConversation);
router.get("/all/:userId", getAllConversations);
router.post("/delete/:conversationId", deleteConversation);

export default router;
