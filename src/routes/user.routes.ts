import express from "express";
import { createUser, getUser } from "../controller/user.controller";

const router = express.Router();

router.post("/create", createUser);
router.get("/:userId", getUser);

export default router;
