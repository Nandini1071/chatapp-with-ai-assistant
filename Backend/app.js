import express from "express";
import connect from "./db/db.js";
import userRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import projectRouter from "./routes/project.route.js";
import aiRouter from "./routes/ai.route.js";

const app = express();
connect();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/users", userRouter);
app.use("/projects", projectRouter);
app.use("/ai", aiRouter);

export default app;
