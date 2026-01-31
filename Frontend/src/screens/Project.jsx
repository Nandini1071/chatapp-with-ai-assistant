import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios";
import {
  intializeSocket,
  recieveMessage,
  sendMessage,
} from "../config/socket.js";
import { userContext } from "../context/UserContext.jsx";

const Project = () => {
  const location = useLocation();
  const [sidePanelOpen, setsidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set()); // Initialized as Set
  const [users, setUsers] = useState([]);
  const [project, setproject] = useState(location.state.project);
  const [message, setmessage] = useState("");
  const { user } = useContext(userContext);
  const messageRef = useRef();

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }

      return newSelectedUserId;
    });
  };

  function addCollaborators() {
    axios
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId),
      })
      .then(() => {
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function sendMess() {
    console.log(user);
    sendMessage("project-message", {
      message,
      sender: user,
    });
    appendOutgointMessage(message);
    setmessage("");
  }

  useEffect(() => {
    const socket = intializeSocket(project._id);

    const handleProjectMessage = (data) => {
      console.log(data);
      appendIncomingMessages(data);
    };

    // attach handler directly to socket and cleanup on unmount
    socket.on("project-message", handleProjectMessage);

    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get(`/projects/get-project/${location.state.project._id}`)
      .then((res) => {
        setproject(res.data.project);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      socket.off("project-message", handleProjectMessage);
      socket.disconnect();
    };
  }, [project._id]);

  function appendOutgointMessage(messageObject) {
    const messageBox = document.querySelector(".message-box");

    const newMessage = document.createElement("div");
    newMessage.classList.add(
      "ml-auto",
      "max-w-56",
      "message",
      "flex",
      "flex-col",
      "p-2",
      "bg-slate-50",
      "w-fit",
      "rounded-md",
    );
    newMessage.innerHTML = `
                    <small class='opacity-65 text-xs'>${user.email}</small>
                    <p class='text-sm'>${message}</p>
                `;
    messageBox.appendChild(newMessage);
    scrollToBottom();
  }
  function appendIncomingMessages(messageObject) {
    const messageBox = document.querySelector(".message-box");
    const message = document.createElement("div");
    message.classList.add(
      "message",
      "max-w-56",
      "flex",
      "flex-col",
      "p-2",
      "bg-slate-50",
      "w-fit",
      "rounded-md",
    );
    message.innerHTML = `
      <small class='opacity-65 text-xs'>${messageObject.sender.email}</small>
                <p class='text-sm'>${messageObject.message}</p>
    `;
    messageBox.appendChild(message);
    scrollToBottom();
  }

  function scrollToBottom() {
    messageRef.current.scrollTop = messageRef.current.scrollHeight;
  }

  return (
    <main className="h-screen w-screen flex">
      <section className="left flex flex-col h-screen min-w-96 bg-slate-300 relative">
        <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute top-0">
          <button
            className="flex gap-2 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="ri-add-fill mr-1"></i>
            <p>Add Collaborator</p>
          </button>
          <button
            className="p-2"
            onClick={() => setsidePanelOpen(!sidePanelOpen)}
          >
            <i className="ri-group-fill cursor-pointer"></i>
          </button>
        </header>
        <div className="conversation-area pt-14 pb-10 flex flex-col grow relative max-h-full">
            <div
              ref={messageRef}
              className="message-box grow flex flex-col gap-1 p-1 overflow-auto max-h-full"
            ></div>
          <div className="input-field w-full flex absolute bottom-0">
            <input
              type="text"
              value={message}
              onChange={(e) => setmessage(e.target.value)}
              placeholder="Enter message"
              className="p-2 px-4 border-none outline-none flex grow bg-white"
            />
            <button
              className="cursor-pointer px-5 bg-slate-950 text-white"
              onClick={sendMess}
            >
              <i className="ri-send-plane-fill w-10 h-10"></i>
            </button>
          </div>
        </div>
        <div
          className={`w-full h-full absolute bg-slate-50 flex flex-col gap-2 transition-all ${sidePanelOpen ? "translate-x-0" : "-translate-x-full"} top-0`}
        >
          <header className="flex justify-between items-center p-3 px-3 bg-slate-200">
            <h1 className="font-semibold text-lg">Collaborators</h1>
            <button
              className="cursor-pointer"
              onClick={() => setsidePanelOpen(!sidePanelOpen)}
            >
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="flex flex-col gap-2">
            {project.users &&
              project.users.map((user) => {
                return (
                  <div
                    className="flex gap-2 items-center cursor-pointer hover:bg-slate-200 p-2"
                    key={user.email}
                  >
                    <div className="rounded-full p-5 bg-slate-600 w-fit h-fit flex items-center justify-center relative text-white">
                      <i className="ri-user-fill absolute"></i>
                    </div>
                    <h1 className="font-semibold text-lg">{user.email}</h1>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <div className="bg-white p-4 rounded-md w-96 relative">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select User</h2>
              <button
                className="cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-2 mb-6 max-h-96 overflow-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`user cursor-pointer hover:bg-slate-300 ${Array.from(selectedUserId).indexOf(user._id) != -1 ? "bg-slate-200" : ""} p-2 flex gap-2 items-center`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className="aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                    <i className="ri-user-fill absolute"></i>
                  </div>
                  <h1 className="font-semibold text-lg">{user.email}</h1>
                </div>
              ))}
            </div>
            <button
              className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={addCollaborators}
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
