import express from "express";
import {createOrUpdate, destroy, index, show} from "../../controllers/user/chat/ChatController";
import userAuthMiddleware from "../../middleware/user-auth-middleware";

const router = express.Router();

router.get("/", userAuthMiddleware, index);
router.put("/:partnerId", userAuthMiddleware, createOrUpdate);
router.get("/:id", userAuthMiddleware, show);
router.delete("/:id", userAuthMiddleware, destroy);

const chatRoutes = (app) => {
    app.use("/chat", router);
};

export default chatRoutes;