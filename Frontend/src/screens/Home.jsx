import React, { useState } from "react";
import { useContext } from "react";
import { userContext } from "../context/UserContext";
import axios from "../config/axios";

const Home = () => {
  const { user } = useContext(userContext);
  const [isModal, setisModal] = useState(false);
  const [projectName, setprojectName] = useState("");

  function createProject(e) {
    e.preventDefault();
    axios
      .post("/projects/create", {
        name: projectName,
      })
      .then((res) => {
        console.log(res);
        setisModal(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div>
      <main className="p-4">
        <div className="projects">
          <button
            onClick={() => setisModal(true)}
            className="project p-4 border border-slate-300 rounded-md cursor-pointer"
          >
            New Project
            <i className="ri-link ml-2"></i>
          </button>
        </div>
        {isModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-md w-1/3">
              <h2 className="text-xl mb-4">Create New Project</h2>
              <form onSubmit={createProject}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setprojectName(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                    onClick={() => setisModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
