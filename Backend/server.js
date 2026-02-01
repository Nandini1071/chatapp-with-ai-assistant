import http from "http";
import app from "./app.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Project from "./models/project.model.js";
import { generateResult } from "./services/ai.service.js";

dotenv.config();

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    const projectId = socket.handshake.query.projectId;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid ProjectId!"));
    }
    socket.project = await Project.findById(projectId);
    if (!token) {
      return next(new Error("Authentication Error!"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(new Error("Authentication Error!"));
    }
    socket.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
});

io.on("connection", (socket) => {
  socket.roomId = socket.project._id.toString();
  console.log("connected");
  socket.join(socket.roomId);

  socket.on("project-message",async (data) => {
    console.log(data);
    const message=data.message;
    const aiIsPresentInMessage=message.includes("@ai");
    if(aiIsPresentInMessage){
      const prompt=message.replace("@ai",'');
      const result=await generateResult(prompt);
      io.to(socket.roomId).emit("project-message",{
        message: result,
        sender:{
          _id: 'ai',
          email: 'AI'
        }
      })
      return;
    }
    socket.broadcast.to(socket.roomId).emit("project-message", {});
  });
  socket.on("disconnect", () => {
    console.log("disconnected");
    socket.leave(socket.roomId);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
