import * as jwt from 'express-jwt';
import { key, issuer } from '../config/config';

/**
 * Configuration for JWT middleware.
 *
 * @author Gustavus Shaw II
 */
export const enforceTokenAccess = jwt({
  secret: key,
  issuer: issuer,
  getToken: (req) => {
    return req.cookies.presence;
  },
}).unless({
  // Routes that don't require authorization
  path: [
    '/',
    { url: '/users', methods: ['POST']  }, // register
    '/users/ota-codes', // all ota-code routes do their own verifcation outsides of JWT
    { url: '/users/tokens', methods: ['POST'] }], // login
});
