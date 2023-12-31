/*
 *
 */

import {Router} from "express";

const apiUserRouter: Router = Router();

import authRoutes from "./AuthRouter";
import profileRoutes from "./ProfileRoute";
import chatRoutes from "./ChatRoute";
import messageRoutes from "./MessageRoute";
import postRoutes from "./PostRoute";


authRoutes(apiUserRouter);
profileRoutes(apiUserRouter);
chatRoutes(apiUserRouter);
messageRoutes(apiUserRouter);
postRoutes(apiUserRouter);

export default apiUserRouter;