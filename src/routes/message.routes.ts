import express from "express";
import { sendMessage } from "../controller/message.controller";

const router = express.Router();

router.post("/new-message", sendMessage);

export default router;
