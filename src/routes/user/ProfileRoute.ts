import express from 'express'
import UserAuthMiddleware from '../../middleware/user-auth-middleware'
import {
  coverPhoto,
  follow,
  photo,
  rmCoverPhoto,
  rmPhoto,
  show,
  UnFollow,
  update
} from '../../controllers/ProfileController';

const router = express.Router()

router.get('/', UserAuthMiddleware, show);
router.put('/', UserAuthMiddleware, update);
router.post('/photo', UserAuthMiddleware, photo);
router.post('/cover-photo', UserAuthMiddleware, coverPhoto);
router.delete('/photo', UserAuthMiddleware, rmPhoto);
router.delete('/cover-photo', UserAuthMiddleware, rmCoverPhoto);
router.put('/:partnerId/follow', UserAuthMiddleware, follow);
router.delete('/:partnerId/unfollow', UserAuthMiddleware, UnFollow);

const profileRoutes = (app) => {
  app.use('/profile', router);
};

export default profileRoutes;