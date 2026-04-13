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
let socketEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("a user connected: " + socket.id);

  socket.on("join_room", (data) => {
    const { roomId, email } = data;
    socketMap.set(email, socket.id);
    socketEmailMap.set(socket.id, email);
    console.log("Joining the room", email, roomId, socket.id);
    socket.join(roomId);
    socket.emit("joined_room", { email, roomId });
    socket.broadcast.to(roomId).emit("user_joined", { email });
  });
  socket.on("call-user", (data) => {
    const { offer, email } = data;
    const targetSocketId = socketMap.get(email);
    let from = socketEmailMap.get(socket.id);
    console.log(
      "🖥️ SERVER: sending incoming-call to",
      email,
      "socketId:",
      targetSocketId,
    );
    if (targetSocketId) {
      setTimeout(() => {
        // give navya time to mount Room component
        socket.to(targetSocketId).emit("incoming-call", { offer, from });
      }, 1000);
    }
  });
  socket.on("call-accepted", (data) => {
    const { answer, from } = data;
    const targetSocketId = socketMap.get(from);
    socket.to(targetSocketId).emit("call-accepted", { answer });
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
