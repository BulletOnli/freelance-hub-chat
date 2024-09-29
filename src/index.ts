import express from "express";
import { createServer } from "http";
import "dotenv/config";
import { Server } from "socket.io";
import cors from "cors";

const port = process.env.PORT || 8080;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

// mongoose.connect(process.env.MONGO_URI!).then(() => {
//   console.log("DB Connected");
// });

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Join a room based on user ID (temporary) when the user connects
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Handle sending messages
  socket.on("message", (arg) => {
    // Emit message to the recipient
    socket.to(arg.roomKey).emit("message", arg);
  });
});
