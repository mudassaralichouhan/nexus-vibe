import Express from "express";

import UserAuthMiddleware from "../../middleware/user-auth-middleware";
import {forgotPassword, login, passwordChange, register, resetPassword} from "../../controllers/user/AuthController";
import {auth, logout, refreshToken} from "../../controllers/AuthController";

const router = Express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/token/refresh", refreshToken);
router.delete("/logout", UserAuthMiddleware, logout);
router.get("/", UserAuthMiddleware, auth);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset", resetPassword);
router.post("/password/change", UserAuthMiddleware, passwordChange);

const authRoutes = (app) => {
  app.use('/auth', router);
};

export default authRoutes;