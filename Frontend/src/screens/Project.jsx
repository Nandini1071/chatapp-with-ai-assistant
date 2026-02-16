import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios";
import { intializeSocket, sendMessage } from "../config/socket.js";
import { userContext } from "../context/UserContext.jsx";
import Markdown from "markdown-to-jsx";
import CodeEditor from "../components/CodeEditor";

const Project = () => {
  const location = useLocation();
  const [sidePanelOpen, setsidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [users, setUsers] = useState([]);
  const [fileTree, setfileTree] = useState({});
  const [currentFile, setcurrentFile] = useState(null);
  const [openFiles, setopenFiles] = useState([]);
  const [aiHasFiles, setAiHasFiles] = useState(false);
  const [loadingZip, setLoadingZip] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [project, setproject] = useState(location.state.project);
  const [message, setmessage] = useState("");
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");
  const { user } = useContext(userContext);
  const messageRef = useRef();

  useEffect(() => {
    console.log("Project component mounted");
    const onDocClick = (e) => {
      console.debug(
        "document click:",
        e.target &&
          e.target.tagName +
            "#" +
            (e.target.id || "") +
            "." +
            (e.target.className || ""),
      );
    };
    window.addEventListener("click", onDocClick);

    // diagnostic: query key elements and log geometry + pointer-events
    const probe = () => {
      const selectors = [
        '[data-test="add-collab-btn"]',
        '[data-test="download-zip-btn"]',
        '[data-test="toggle-panel-btn"]',
      ];
      selectors.forEach((sel) => {
        const el = document.querySelector(sel);
        if (!el) {
          console.warn("Missing element for selector", sel);
          return;
        }
        const rect = el.getBoundingClientRect();
        const cs = window.getComputedStyle(el);
        console.log(
          `Probe ${sel}: rect=${JSON.stringify(rect)}, pointerEvents=${cs.pointerEvents}, visibility=${cs.visibility}, display=${cs.display}, zIndex=${cs.zIndex}`,
        );

        // attach capture listener to see if events hit this element specifically
        const onCap = (ev) => {
          console.log(
            `Capture on ${sel}: type=${ev.type}, target=` +
              (ev.target && ev.target.tagName + "#" + (ev.target.id || "")),
          );
        };
        el.addEventListener("click", onCap, true);
        // store on element so we can remove later
        el.__diag_onCap = onCap;

        // elementFromPoint check at center
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const top = document.elementFromPoint(cx, cy);
        console.log(
          `Top element at center of ${sel}:`,
          top &&
            top.tagName + "#" + (top.id || "") + "." + (top.className || ""),
        );
      });
    };

    // run probe after a tick to allow layout
    setTimeout(probe, 100);

    return () => {
      window.removeEventListener("click", onDocClick);
      // cleanup any attached diag listeners
      [
        '[data-test="add-collab-btn"]',
        '[data-test="download-zip-btn"]',
        '[data-test="toggle-panel-btn"]',
      ].forEach((sel) => {
        const el = document.querySelector(sel);
        if (el && el.__diag_onCap) {
          el.removeEventListener("click", el.__diag_onCap, true);
          delete el.__diag_onCap;
        }
      });
    };
  }, []);

  // Safely parse incoming message payloads for rendering.
  // Handles raw strings, JSON-encoded strings, and common object shapes.
  function parseMessageField(raw) {
    if (raw === null || raw === undefined) return "";
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;

      if (parsed && typeof parsed === "object") {
        if (typeof parsed.content === "string") return parsed.content;
        if (typeof parsed.text === "string") return parsed.text;
        if (typeof parsed.markdown === "string") return parsed.markdown;
        return JSON.stringify(parsed);
      }

      return String(parsed);
    } catch (err) {
      return String(raw);
    }
  }

  const handleUserClick = (id) => {
    console.log("handleUserClick:", id);
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

  async function addCollaborators() {
    console.log("addCollaborators clicked", Array.from(selectedUserId));
    setErrorMessage("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("You must be logged in to add collaborators.");
        return;
      }
      if (!selectedUserId || selectedUserId.size === 0) {
        setErrorMessage("Select at least one user to add.");
        return;
      }

      await axios.put("/projects/add-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId),
      });
      setIsModalOpen(false);
      // refresh project data
      const proj = await axios.get(
        `/projects/get-project/${location.state.project._id}`,
      );
      setproject(proj.data.project);
    } catch (err) {
      console.error("addCollaborators error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err.message ||
        "Failed to add collaborators";
      setErrorMessage(String(msg));
    }
  }

  function sendMess() {
    console.log(user);

    // If there are already files, show dialog to ask Replace or Merge
    if (Object.keys(fileTree).length > 0) {
      setPendingMessage(message);
      setIsReplaceDialogOpen(true);
      return;
    }

    // Otherwise send immediately
    performSendMessage(message);
    setmessage("");
  }

  function performSendMessage(messageText) {
    sendMessage("project-message", {
      message: messageText,
      sender: user,
    });
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: user, message: messageText },
    ]);
  }

  // function handleReplace() {
  //   // Clear all existing files
  //   setfileTree({});
  //   setopenFiles([]);
  //   setcurrentFile(null);
  //   setAiHasFiles(false);

  //   // Send the message
  //   performSendMessage(pendingMessage);
  //   setmessage("");
  //   setIsReplaceDialogOpen(false);
  //   setPendingMessage("");
  // }
  function handleReplace() {
    // Tell everyone to clear files
    sendMessage("replace-files", {});

    // Then send AI message
    performSendMessage(pendingMessage);

    setmessage("");
    setIsReplaceDialogOpen(false);
    setPendingMessage("");
  }

  function handleMerge() {
    // Keep existing files and just add new ones
    performSendMessage(pendingMessage);
    setmessage("");
    setIsReplaceDialogOpen(false);
    setPendingMessage("");
  }

  useEffect(() => {
    const socket = intializeSocket(project._id);

    const handleProjectMessage = (data) => {
      console.log("socket message:", data);
      setMessages((prevMessages) => [...prevMessages, data]);

      const tryParse = (maybe) => {
        if (maybe === null || maybe === undefined) return null;
        if (typeof maybe === "object") return maybe;
        try {
          return JSON.parse(maybe);
        } catch (e) {
          try {
            const s = String(maybe);
            const first = s.indexOf("{");
            const last = s.lastIndexOf("}");
            if (first !== -1 && last !== -1 && last > first) {
              return JSON.parse(s.substring(first, last + 1));
            }
          } catch (e2) {
            return null;
          }
        }
        return null;
      };

      try {
        const rawMsg = data.message;
        const parsedField = parseMessageField(rawMsg);
        const candidate = tryParse(rawMsg) || tryParse(parsedField);
        console.log("parsed candidate:", candidate);
        if (candidate && typeof candidate === "object") {
          const fileTreeSource =
            candidate.fileTree ||
            candidate.files ||
            candidate.filesTree ||
            candidate;
          const normalized = {};

          const flatten = (node, path = "") => {
            if (!node) return;
            if (Array.isArray(node)) {
              node.forEach((item) => {
                const name = item.name || item.filename || item.path;
                const contents =
                  item.contents ||
                  item.content ||
                  item.body ||
                  (item.file && (item.file.contents || item.file)) ||
                  JSON.stringify(item);
                if (name) {
                  const key = path ? `${path}/${name}` : name;
                  normalized[key] = {
                    content:
                      typeof contents === "string"
                        ? contents
                        : JSON.stringify(contents),
                  };
                }
              });
              return;
            }

            if (
              node &&
              typeof node === "object" &&
              (node.file || node.content || node.contents)
            ) {
              if (path && (node.file || node.content || node.contents)) {
                const contents =
                  node.content ||
                  node.contents ||
                  (node.file && (node.file.contents || node.file)) ||
                  JSON.stringify(node);
                normalized[path] = {
                  content:
                    typeof contents === "string"
                      ? contents
                      : JSON.stringify(contents),
                };
                return;
              }
            }

            if (
              node &&
              typeof node === "object" &&
              node.directory &&
              typeof node.directory === "object"
            ) {
              Object.keys(node.directory).forEach((k) =>
                flatten(node.directory[k], path ? `${path}/${k}` : k),
              );
              return;
            }

            if (node && typeof node === "object") {
              Object.keys(node).forEach((k) => {
                if (
                  k === "text" ||
                  k === "buildCommand" ||
                  k === "startCommand"
                )
                  return;
                flatten(node[k], path ? `${path}/${k}` : k);
              });
            }
          };

          flatten(fileTreeSource, "");

          if (Object.keys(normalized).length > 0) {
            console.log(
              "Merging AI fileTree into editor:",
              Object.keys(normalized),
            );
            setfileTree((prev) => ({ ...prev, ...normalized }));
            setAiHasFiles(true);
            const firstFile = Object.keys(normalized)[0];
            if (firstFile) {
              setcurrentFile(firstFile);
              setopenFiles((prev) => [...new Set([...prev, firstFile])]);
            }
          }
        }
      } catch (err) {
        console.log("AI fileTree parsing failed:", err.message || err);
      }
    };

    // attach handler directly to socket and cleanup on unmount
    socket.on("project-message", handleProjectMessage);
    socket.on("replace-files", () => {
      console.log("Received replace-files event");

      setfileTree({});
      setopenFiles([]);
      setcurrentFile(null);
      setAiHasFiles(false);
    });

    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users || []);
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
      socket.off("replace-files");
      socket.disconnect();
    };
  }, [project._id]);

  function scrollToBottom() {
    messageRef.current.scrollTop = messageRef.current.scrollHeight;
  }
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function downloadZip() {
    console.log("downloadZip clicked");
    setErrorMessage("");
    setLoadingZip(true);
    if (Object.keys(fileTree).length === 0) {
      setErrorMessage("No generated files to zip.");
      setLoadingZip(false);
      return;
    }
    try {
      const resp = await axios.post(
        "/ai/zip",
        { fileTree },
        { responseType: "arraybuffer" },
      );
      const blob = new Blob([resp.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${location.state.project.title || "project"}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("downloadZip error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to download zip";
      setErrorMessage(String(msg));
    } finally {
      setLoadingZip(false);
    }
  }

  return (
    <main className="h-screen w-screen flex">
      <section className="left flex flex-col h-screen min-w-96 bg-gradient-to-b from-slate-50 to-slate-100 relative">
        <header
          style={{ zIndex: 50, pointerEvents: "auto" }}
          className="flex justify-between items-center p-4 px-6 w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white absolute top-0 shadow-lg rounded-b-lg"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/20 p-2">
              <i className="ri-hashtag" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {project?.title || project?.name || "Project"}
              </h2>
              <p className="text-xs opacity-80">Collaborative AI workspace</p>
            </div>
          </div>

          <div className="flex w-full gap-3 items-center mt-3 md:mt-0 md:w-auto">
            <div className="flex-1 md:flex-none">
              <div className="text-sm opacity-90">
                {project?.description || ""}
              </div>
            </div>
            <div className="flex gap-3 items-center">
              {aiHasFiles && (
                <button
                  data-test="download-zip-btn"
                  className="px-4 py-2 bg-white text-indigo-600 rounded-full font-medium hover:bg-white/90 transition-shadow shadow-sm"
                  disabled={loadingZip}
                  onClick={downloadZip}
                >
                  {loadingZip ? "Preparing..." : "Download ZIP"}
                </button>
              )}

              <button
                data-test="add-collab-btn"
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg"
                onClick={() => {
                  console.log("open add-collab modal");
                  setIsModalOpen(true);
                }}
              >
                <i className="ri-add-fill" />
                <span className="text-sm">Add</span>
              </button>

              <button
                data-test="toggle-panel-btn"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-md"
                onClick={() => {
                  console.log("toggle side panel");
                  setsidePanelOpen(!sidePanelOpen);
                }}
              >
                <i className="ri-group-fill"></i>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="absolute right-6 top-20 bg-red-100 text-red-800 px-3 py-1 rounded shadow">
              {errorMessage}
            </div>
          )}
        </header>
        <div className="conversation-area pt-24 pb-10 flex flex-col grow relative max-h-full">
          <div
            ref={messageRef}
            className="message-box grow flex flex-col gap-2 p-2 overflow-auto max-h-full"
          >
            {messages.map((msg, index) => {
              // Some tokens only include `email` (no `_id`), so compare by `_id` OR `email`.
              const isMe =
                (msg.sender?._id && user?._id && msg.sender._id === user._id) ||
                msg.sender?.email === user?.email;

              // Detect AI sender by `_id` or by email/name fallback.
              const isAI =
                msg.sender?._id === "ai" ||
                (typeof msg.sender?.email === "string" &&
                  msg.sender.email.toLowerCase() === "ai");

              return (
                <div
                  key={index}
                  className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-2 rounded-md text-sm ${
                      isMe
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 text-black"
                    }`}
                  >
                    <small className="opacity-60 block mb-1">
                      {isAI ? "AI Assistant" : msg.sender?.email}
                    </small>

                    {(() => {
                      const content = parseMessageField(msg.message);
                      return isAI ? (
                        <Markdown>{content}</Markdown>
                      ) : (
                        <p>{content}</p>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>

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
      <section className="right flex grow h-full bg-slate-100">
        <aside className="explore h-full w-72 p-4">
          <div className="file-tree w-full bg-white rounded-lg shadow p-3 divide-y">
            {Object.keys(fileTree).length === 0 ? (
              <div className="p-4 text-sm text-slate-500">
                No files yet — AI will populate files here.
              </div>
            ) : (
              Object.keys(fileTree).map((file) => (
                <button
                  key={file}
                  onClick={() => {
                    setcurrentFile(file);
                    setopenFiles([...new Set([...openFiles, file])]);
                  }}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-indigo-50 transition-colors ${currentFile === file ? "bg-indigo-50" : ""}`}
                >
                  <div className="w-6 text-indigo-500">📄</div>
                  <div className="flex-1 truncate text-sm font-medium text-slate-800">
                    {file}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          {currentFile ? (
            <div className="code-editor flex flex-col grow h-full">
              <div className="code-editor-header flex items-center p-2 bg-white border-b">
                {openFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => setcurrentFile(file)}
                    className={`px-3 py-1 rounded-t-md ${currentFile === file ? "bg-white" : "bg-slate-100"}`}
                  >
                    {file}
                  </button>
                ))}
                <div className="ml-auto">
                  <button
                    className="p-2 text-slate-600"
                    onClick={() => setcurrentFile(null)}
                  >
                    <i className="ri-close-fill"></i>
                  </button>
                </div>
              </div>
              <div className="editor-content grow w-full bg-slate-900">
                {fileTree[currentFile] && (
                  <CodeEditor
                    filename={currentFile}
                    content={fileTree[currentFile].content}
                    onChange={(newContent) => {
                      setfileTree({
                        ...fileTree,
                        [currentFile]: {
                          content: newContent,
                        },
                      });
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="grow flex items-center justify-center text-slate-500">
              Select a file to view or edit
            </div>
          )}
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
                  key={user._id || user.id || user.email}
                  className={`user cursor-pointer hover:bg-slate-300 ${selectedUserId.has(user._id) ? "bg-slate-200" : ""} p-2 flex gap-2 items-center`}
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

      {isReplaceDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h2 className="text-xl font-semibold mb-3">Files Already Exist</h2>
            <p className="text-slate-600 mb-6">
              You already have {Object.keys(fileTree).length} file(s) in the
              editor. What would you like to do?
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                onClick={handleReplace}
              >
                <div className="font-semibold">Replace</div>
                <div className="text-xs opacity-90">
                  Clear old files & generate new ones
                </div>
              </button>
              <button
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                onClick={handleMerge}
              >
                <div className="font-semibold">Merge</div>
                <div className="text-xs opacity-90">
                  Keep old & add new files
                </div>
              </button>
            </div>
            <button
              className="w-full mt-3 text-slate-600 hover:text-slate-800 text-sm"
              onClick={() => {
                setIsReplaceDialogOpen(false);
                setPendingMessage("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
