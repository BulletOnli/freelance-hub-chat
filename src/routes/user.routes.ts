import express from "express";
import { createUser, getUser } from "../controller/user.controller";

const router = express.Router();

router.get("/:userId", getUser);
router.post("/create", createUser);

export default router;
