import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Connected", socket.id);

  socket.on("joinRoom", (data: { username: string; roomId: string }) => {
    socket.join(data.roomId);
    console.log(`User ${data.username} joined room ${data.roomId}`);
  });

  socket.on("sendMessage", (data) => {
    console.log(`Data from ${data.username}`, data.message);
    socket.to(data.roomId).emit("recieveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected", socket.id);
  });
});

httpServer.listen(3000);
