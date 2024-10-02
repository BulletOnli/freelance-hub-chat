import express from "express";
import { getUser } from "../controller/user.controller";

const router = express.Router();

router.get("/:userId", getUser);

export default router;
