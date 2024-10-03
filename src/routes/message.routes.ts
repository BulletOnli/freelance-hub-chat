import express from "express";
import { getAllMessages, sendMessage } from "../controller/message.controller";

const router = express.Router();

router.get("/all", getAllMessages);
router.post("/new-message", sendMessage);

export default router;
