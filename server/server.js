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

io.on("connection", (socket) => {
  console.log("a user connected: " + socket.id);
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
});
