import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import {
  addUserProject,
  createProject,
  getAllProject,
  getProjectById,
} from "../services/project.service.js";
import { validationResult } from "express-validator";

export const createProjectController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name } = req.body;
    const loggedInUser = await User.findOne({ email: req.user.email });
    const userId = loggedInUser._id;
    const newProject = await createProject({ name, userId });
    res.status(201).json(newProject);
  } catch (error) {
    console.log(error);
    res.status(400).json(error.message);
  }
};

export const getAllProjectController = async (req, res) => {
  try {
    const loogedInUser = await User.findOne({
      email: req.user.email,
    });
    const allUserProject = await getAllProject({ userId: loogedInUser._id });
    return res.status(200).json({ projects: allUserProject });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addUserToProjectController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    console.log("req.body", req.body);
    const { projectId, users } = req.body;
    const loggedInUser = await User.findOne({
      email: req.user.email,
    });
    const project = await addUserProject({
      projectId,
      users,
      userId: loggedInUser._id,
    });
    return res.status(200).json({
      project,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};
export const getProjectIdController = async (req, res) => {
  console.log("Controller HIT");
  const { projectId } = req.params;
  try {
    const project = await getProjectById({ projectId });
    return res.status(200).json({ project });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};
