import mongoose from "mongoose";
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

export const getAllProject = async ({ userId }) => {
  if (!userId) {
    throw new Error("User Id is required!");
  }
  const projectList = await Project.find({
    users: userId,
  });
  return projectList;
};

export const addUserProject = async ({ projectId, users, userId }) => {
  if (!projectId) {
    throw new Error("project id is required!");
  }
  if (!users) {
    throw new Error("users are required!");
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project id");
  }
  if (
    !Array.isArray(users) ||
    users.some((userId) => !mongoose.Types.ObjectId.isValid(userId))
  ) {
    throw new Error("Invalid userId(s) in users array");
  }
  if (!userId) {
    throw new Error("user id is required!");
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user id");
  }
  const project = await Project.findOne({
    _id: projectId,
    users: userId,
  });
  if (!project) {
    throw new Error("user does not belong to this project!");
  }
  const updateProject = await Project.findOneAndUpdate(
    {
      _id: projectId,
    },
    {
      $addToSet: {
        users: {
          $each: users,
        },
      },
    },
    {
      new: true,
    }
  );
  return updateProject;
};
export const getProjectById = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("project id is required");
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project");
  }
  const project = await Project.findOne({
    _id: projectId,
  }).populate('users');
  return project;
};
