import {Router} from 'express';
import { getResult } from '../controllers/ai-controller.js';

const aiRouter=Router();

aiRouter.get("/get-result",getResult)

export default aiRouter;