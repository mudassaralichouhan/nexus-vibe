/*
 *
 */

import express, {Express} from "express";
import apiUserRouter from "./user";
import apiAdminRouter from "./admin";
import vhost from "vhost";

const routers = (app: Express) => {
  const mainApp = express();
  const userApp = express();
  const adminApp = express();

  userApp.use(apiUserRouter)
  adminApp.use(apiAdminRouter)

  mainApp.use(vhost("localhost", userApp));
  mainApp.use(vhost("admin.localhost", adminApp));

  // Use the '/api' prefix for all routes
  app.use('/api', mainApp)
};

export default routers;