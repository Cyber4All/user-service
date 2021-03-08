import 'dotenv/config';
import * as jwt from 'express-jwt';
import { getToken } from './functions';
import { NextFunction, Response, Request } from 'express';
import { reportError } from '../shared/SentryConnector';

/**
 * Validates and decodes token from cookie or authorization headers. Then sets request.user to decoded token.
 *
 * @param {Request} request
 * @param {Response} response
 * @param {NextFunction} next
 */
export const processToken = jwt({
  secret: process.env.KEY,
  issuer: process.env.ISSUER,
  credentialsRequired: false,
  algorithms: ['HS256'],
  getToken
});

/**
 * Handles errors that may occur when processing the token.
 * If the token is invalid the handler will call the next handler because its job is solely to attempt to process the token not enforce it
 * If some other error occurs, the handler reports the error
 *
 * @param {Error} error
 * @param {Request} request
 * @param {Response} response
 * @param {NextFunction} next
 */
export const handleProcessTokenError = (
  error: Error,
  _: Request,
  __: Response,
  next: NextFunction
) => {
  if (error.name !== 'UnauthorizedError' && error.name !== 'JsonWebTokenError') {
    reportError(error);
  }
  next();
};
