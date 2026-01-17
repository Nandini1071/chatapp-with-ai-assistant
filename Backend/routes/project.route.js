import { Router } from "express";
import { body } from "express-validator";
import {
  createProjectController,
  getAllProjectController,
  addUserToProjectController,
  getProjectIdController,
} from "../controllers/project.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

const projectRouter = Router();

projectRouter.post(
  "/create",
  authUser,
  body("name").isString().withMessage("Name is required!"),
  createProjectController
);

projectRouter.get("/all", authUser, getAllProjectController);

projectRouter.put(
  "/add-user",
  authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("users")
    .isArray({ min: 1 })
    .withMessage("User must be an array of strings")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("Each user must be a string"),
  addUserToProjectController
);
projectRouter.get("/get-project/:projectId", authUser, getProjectIdController);
export default projectRouter;
