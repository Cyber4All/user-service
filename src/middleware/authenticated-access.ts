import 'dotenv/config';
import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { getToken } from './functions';
import { reportError } from '../shared/SentryConnector';

/**
 * Checks if decoded token is set in request.
 * If user is not set, the token is verified from cookie presence or Bearer token
 * If no user and no valid token, responds with 401
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
export function enforceAuthenticatedAccess(
  req: Request,
  res: Response,
  next: Function
) {
  if (!req['user']) {
    req['user'] = decodeToken(req);
  }
  if (req['user']) {
    next();
  } else {
    res.status(401).send('Invalid access!');
  }
}

/**
 * Attempts to verify and decode token.
 * Reports Error if error is not an UnauthorizedError
 *
 * @param {Request} req
 * @returns
 */
function decodeToken(req: Request) {
  let user;
  try {
    const token = getToken(req);
    user = jwt.verify(token, process.env.KEY);
  } catch (e) {
    if (e.name !== 'UnauthorizedError') {
      reportError(e);
    }
  }
  return user;
}
