import express from "express";
import { createServer } from "http";
import "dotenv/config";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";

import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import messageRoutes from "./routes/message.routes";
import errorHandler from "./middlewares/errorHandler";

const app = express();
const port = process.env.PORT || 8080;
const server = createServer(app);

// Configure Socket.io with CORS settings
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/user", userRoutes);

app.use(errorHandler);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection error:", err));

const users = {} as any;

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    users[userId] = socket.id;
    console.log(`User ${userId} joined room`);
  });

  socket.on("message", (arg) => {
    if (!users[arg.conversationKey]) {
      return console.log(`User not in room: ${users[arg.conversationKey]}`);
    }

    socket.to(users[arg.conversationKey]).emit("message", arg);
    console.log(`Message sent to room: ${users[arg.conversationKey]}`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
