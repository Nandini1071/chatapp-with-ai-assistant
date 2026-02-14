import { Router } from "express";
import { getResult, generate, zipProject } from "../controllers/ai.controller.js";

const aiRouter = Router();

aiRouter.get("/get-result", getResult);
aiRouter.post("/generate", generate);
aiRouter.post("/zip", zipProject);

export default aiRouter;