import express from "express";
import {deactivate, resetPassword, resetProfile, show} from "../../controllers/admin/UserController";
import AdminUserMiddleWare from "../../middleware/admin-auth-middleware";

const router = express.Router();

router.get("/", AdminUserMiddleWare, show);
router.put("/reset", AdminUserMiddleWare, resetProfile);
router.put("/reset-password", AdminUserMiddleWare, resetPassword);
router.delete("/de-active", AdminUserMiddleWare, deactivate);

const adminUserRoutes = (app) => {
    app.use("/user/:id", router);
};

export default adminUserRoutes;