import * as jwt from 'express-jwt';
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Configuration for JWT middleware.
 *
 * @author Gustavus Shaw II
 */
export const enforceTokenAccess = jwt({
  secret: process.env.KEY,
  issuer: process.env.ISSUER,
  getToken: req => {
    return req.cookies.presence;
  }
}).unless({
  // Routes that don't require authorization
  path: [
    '/',
    '/validate-captcha',
    { url: '/users', methods: ['POST', 'GET'] }, // register & search
    '/users/ota-codes', // all ota-code routes do their own verifcation outsides of JWT
    { url: '/users/tokens', methods: ['POST'] }
  ] // login
});
