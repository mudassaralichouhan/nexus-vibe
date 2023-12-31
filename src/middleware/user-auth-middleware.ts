import {NextFunction, Request, Response} from 'express';
import {ROLES} from "../controllers/admin/AuthController";
import {verifySessionId} from "../services/auth-token-service";

const UserAuthMiddleware = async (request: Request, response: Response, next: NextFunction) => {
  return verifySessionId(request, response, next, ROLES.user);
};

export default UserAuthMiddleware;