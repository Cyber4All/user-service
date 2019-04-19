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
  router.get('/users/:userId/open-id-token', getOpenIdToken);
  return router;
}

/**
 * Transforms request data and calls interactor to get OpenId token
 *
 * @param {Request} req [The express request object]
 * @param {Response} res [The express response object]
 */
async function getOpenIdToken(req: Request, res: Response) {
  try {
    const requester: UserToken = req.user;
    const userId: string = req.params.userId;

    const openIdToken = await Interactor.getOpenIdToken({
      requester,
      userId
    });
    res.send({ openIdToken });
  } catch (e) {
    const { code, message } = mapErrorToResponseData(e);
    res.status(code).json({ message });
  }
}
