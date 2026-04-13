import express from "express";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import cors from "cors";
import { createServer } from "http";
const app = express();
let httpServer = createServer(app);

let io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

let socketMap = new Map();

io.on("connection", (socket) => {
  console.log("a user connected: " + socket.id);

  socket.on("join_room", (data) => {
    const { roomId, email } = data;
    socketMap.set(email, socket.id);
    console.log("Joining the room", email, roomId);
    socket.join(roomId);
    socket.emit("joined_room", { email, roomId });
    socket.broadcast.to(roomId).emit("user_joined", { email });
  });

  socket.on("disconnect", (data) => {
    console.log("a user disconnected: " + socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
});
