import { io } from "socket.io-client";

let socketInstance = null;
let currentProjectId = null;

export const intializeSocket = (projectId) => {
  // reuse existing socket if already connected to the same project
  if (socketInstance && socketInstance.connected && currentProjectId === projectId) {
    return socketInstance;
  }

  // if another socket exists, disconnect it first
  if (socketInstance && socketInstance.connected) {
    socketInstance.disconnect();
  }

  currentProjectId = projectId;
  socketInstance = io("http://localhost:3000", {
    auth: {
      token: localStorage.getItem("token"),
    },
    query: {
      projectId,
    },
  });

  return socketInstance;
};

export const recieveMessage = (eventName, cb) => {
  if (!socketInstance) return;
  socketInstance.on(eventName, cb);
};

export const sendMessage = (eventName, data) => {
  if (!socketInstance) return;
  socketInstance.emit(eventName, data);
};