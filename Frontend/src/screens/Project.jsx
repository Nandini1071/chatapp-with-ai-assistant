import React, { useState } from "react";
import { useLocation } from "react-router-dom";

const Project = () => {
  const location = useLocation();
  const [sidePanelOpen, setsidePanelOpen] = useState(false);

  return (
    <main className="h-screen w-screen flex">
      <section className="left flex flex-col h-full min-w-96 bg-slate-300 relative">
        <header className="flex justify-end p-2 px-4 w-full bg-slate-100">
          <button
            className="p-2"
            onClick={() => setsidePanelOpen(!sidePanelOpen)}
          >
            <i className="ri-group-fill cursor-pointer"></i>
          </button>
        </header>
        <div className="conversation-area flex flex-col grow">
          <div className="message-box grow flex flex-col gap-1 p-1">
            <div className="flex flex-col p-2 bg-slate-100 w-fit rounded-md max-w-56">
              <small className="opacity-65 text-sm">example@gmail.com</small>
              <p className="text-sm">Lorem ipsum dolor sit amet.</p>
            </div>
            <div className="ml-auto flex flex-col p-2 bg-slate-100 w-fit rounded-md max-w-56">
              <small className="opacity-65 text-sm">example@gmail.com</small>
              <p className="text-sm">Lorem ipsum dolor sit amet.</p>
            </div>
          </div>
          <div className="input-field w-full flex">
            <input
              type="text"
              placeholder="Enter message"
              className="p-2 px-4 border-none outline-none flex grow bg-white"
            />
            <button className="cursor-pointer px-5 bg-slate-950 text-white">
              <i className="ri-send-plane-fill w-10 h-10"></i>
            </button>
          </div>
        </div>
        <div
          className={`w-full h-full absolute bg-slate-50 flex flex-col gap-2 transition-all ${sidePanelOpen ? "translate-x-0" : "-translate-x-full"} top-0`}
        >
          <header className="flex justify-end p-2 px-3 bg-slate-200">
            <button
              className="cursor-pointer"
              onClick={() => setsidePanelOpen(!sidePanelOpen)}
            >
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center cursor-pointer hover:bg-slate-200 p-2">
              <div className="rounded-full p-5 bg-slate-600 w-fit h-fit flex items-center justify-center relative text-white">
                <i className="ri-user-fill absolute"></i>
              </div>
              <h1 className="font-semibold text-lg">username</h1>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Project;
