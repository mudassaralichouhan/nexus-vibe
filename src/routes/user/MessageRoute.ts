import express from 'express';
import {destroy, show} from '../../controllers/user/chat/MessageController';
import userAuthMiddleware from "../../middleware/user-auth-middleware";

const router = express.Router();

router.get('/:id', userAuthMiddleware, show);
router.delete('/:id', userAuthMiddleware, destroy);

const messageRoutes = (app) => {
    app.use('/message', router);
};

export default messageRoutes;