/*
 *
 */

import {Router} from "express";

const apiAdminRouter: Router = Router();

import adminAuthRoutes from "./AdminAuthRoute";
import adminUserRoutes from "./AdminUserRoute";
import adminProfileRoutes from "./AdminProfileRoute";

adminAuthRoutes(apiAdminRouter);
adminUserRoutes(apiAdminRouter);
adminProfileRoutes(apiAdminRouter);

export default apiAdminRouter;