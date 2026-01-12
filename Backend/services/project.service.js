import Project from "../models/project.model.js";

export const createProject = async ({ name, userId }) => {
  if (!name) {
    throw new Error("Name is required!");
  }
  if (!userId) {
    throw new Error("userId is required!");
  }
  let project;
  try {
    project = await Project.create({
      name,
      users: [userId],
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Project name already exists!");
    }
    throw error;
  }
  return project;
};
