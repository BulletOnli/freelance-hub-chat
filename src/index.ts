import express from "express";
import { createServer } from "http";
import "dotenv/config";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";

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

app.use(errorHandler);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection error:", err));

// Socket.io events
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // User joins room based on user ID
  socket.on("join", (roomKey) => {
    socket.join(roomKey);
    console.log(`User ${roomKey} joined room`);
  });

  // Handle message events
  socket.on("message", (arg) => {
    socket.to(arg.conversation).emit("message", arg);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
