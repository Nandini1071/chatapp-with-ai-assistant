import express from "express";
import connect from "./db/db.js";
import userRouter from "./routes/user.route.js";

const app = express();
connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', userRouter)

export default app;
