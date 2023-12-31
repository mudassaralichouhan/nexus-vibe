import express from "express";
import AdminUserMiddleWare from "../../middleware/admin-auth-middleware";
import {coverPhoto, photo, rmCoverPhoto, rmPhoto, show, update} from "../../controllers/ProfileController";

const router = express.Router();

router.get("/", AdminUserMiddleWare, show);
router.put("/", AdminUserMiddleWare, update);
router.post("/photo", AdminUserMiddleWare, photo);
router.post("/cover-photo", AdminUserMiddleWare, coverPhoto);
router.delete("/photo", AdminUserMiddleWare, rmPhoto);
router.delete("/cover-photo", AdminUserMiddleWare, rmCoverPhoto);

const adminProfileRoutes = (app) => {
    app.use("/profile", router);
};

export default adminProfileRoutes;