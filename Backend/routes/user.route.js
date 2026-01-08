import { Router } from "express";
import { body } from "express-validator";
import {
  createUserController,
  loginController,
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.post(
  "/register",
  body("email").isEmail().withMessage("Email must be a valid address"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be 3 character long."),
  createUserController
);

userRouter.post(
  "/login",
  body("email").isEmail().withMessage("Email must be a valid address"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be 3 character long."),
  loginController
);

export default userRouter;
