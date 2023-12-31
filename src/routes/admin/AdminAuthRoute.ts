import express from "express";
import {
    forgotPassword,
    login,
    passwordChange,
    register,
    registerVerification,
    resetPassword,
} from "../../controllers/admin/AuthController";
import AdminUserMiddleWare from "../../middleware/admin-auth-middleware";
import {auth, logout, refreshToken} from "../../controllers/AuthController";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/register/verified", registerVerification);
router.post("/token/refresh", refreshToken);
router.delete("/logout", AdminUserMiddleWare, logout);
router.get("/", AdminUserMiddleWare, auth);
router.post("/password/forgot", forgotPassword);
router.post("/password/reset", resetPassword);
router.post("/password/change", AdminUserMiddleWare, passwordChange);

const adminAuthRoutes = (app) => {
    app.use("/auth", router);
};

export default adminAuthRoutes;