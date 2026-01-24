import socket from "socket.io-client";

let socketInstance = null;

export const intializeSocket = () => {
  socketInstance = socket("http://localhost:3000",{
    auth:{
        token: localStorage.getItem('token')
    }
  });
  return socketInstance;
};

export const recieveMessage=(eventName,cb)=>{
    socketInstance.on(eventName,cb)
}

export const sendMessage=(eventName,data)=>{
    socketInstance.emit(eventName,data)
}