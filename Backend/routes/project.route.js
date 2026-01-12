import { Router } from "express";
import { body } from "express-validator";
import { createProjectController } from "../controllers/project.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

const projectRouter = Router();

projectRouter.post(
  "/create",
  authUser,
  body("name").isString().withMessage("Name is required!"),
  createProjectController
);
export default projectRouter;
