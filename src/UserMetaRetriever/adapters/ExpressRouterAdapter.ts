import { Router, Request, Response } from 'express';
import * as Interactor from '../Interactor';
import { UserToken } from '../typings';
import { mapErrorToResponseData } from '../../Error';

/**
 * Builds the Express Router for this module
 *
 * @export
 * @returns
 */
export function buildRouter() {
  const router = Router();
  router.get('/users/:id', handleGetUser);
  router.get('/users/:id/roles', handleGetUserRoles);
  return router;
}

/**
 * Transforms request data and calls interactor to get user for requested user
 *
 * @param {Request} req [The express request object]
 * @param {Response} res [The express response object]
 */
async function handleGetUser(req: Request, res: Response) {
  try {
    const requester: UserToken = req['user'];
    const id: string = req.params.id;
    const user = await Interactor.getUser({ requester, id });
    res.send(user);
  } catch (e) {
    const { code, message } = mapErrorToResponseData(e);
    res.status(code).json({ message });
  }
}

/**
 * Transforms request data and calls interactor to get user roles for requested user
 *
 * @param {Request} req [The express request object]
 * @param {Response} res [The express response object]
 */
async function handleGetUserRoles(req: Request, res: Response) {
  try {
    const userToken: UserToken = req['user'];
    const id: string = req.params.id;
    const roles = await Interactor.getUserRoles({
      userToken,
      id
    });
    res.send(roles);
  } catch (e) {
    const { code, message } = mapErrorToResponseData(e);
    res.status(code).json({ message });
  }
}
