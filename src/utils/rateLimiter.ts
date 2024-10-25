import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

export default limiter;
