import express from "express";
import connect from "./db/db.js";
import userRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";

const app = express();
connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use('/users', userRouter)

export default app;
