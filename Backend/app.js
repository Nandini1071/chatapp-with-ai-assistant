import express from "express";
import connect from "./db/db.js";

const app = express();
connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export default app;
