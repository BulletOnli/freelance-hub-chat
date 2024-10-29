import express from "express";
import { createServer } from "http";
import "dotenv/config";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import errorHandler from "./middlewares/errorHandler";
import morgan from "morgan";

import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import messageRoutes from "./routes/message.routes";
import conversationRoutes from "./routes/conversation.routes";
import limiter from "./utils/rateLimiter";

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
app.use(morgan("dev"));
// app.use(limiter);

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/user", userRoutes);
app.use("/api/conversation", conversationRoutes);

app.use(errorHandler);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection error:", err));

type Users = {
  [userId: string]: string;
};

const users: Users = {};

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    users[userId] = socket.id;
    console.log(`User ${userId} joined room`);

    io.emit("onlineStatus", { userId, isConnected: true, users });
  });

  const disconnectUser = () => {
    for (const [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        delete users[userId];
        io.emit("onlineStatus", { userId, isConnected: false });
        console.log("User disconnected", userId);
        break;
      }
    }
  };

  socket.on("logout", disconnectUser);
  socket.on("disconnect", disconnectUser);

  socket.on("message", (arg) => {
    if (!users[arg?.receiver?.userId]) {
      return console.log(`User not in room: ${users[arg?.receiver?.userId]}`);
    }

    socket.to(users[arg?.receiver?.userId]).emit("message", arg);
    console.log(`Message sent to room: ${users[arg?.receiver?.userId]}`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
