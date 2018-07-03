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
    if (req.cookies && req.cookies.presence) {
      return req.cookies.presence;
    }
    if (
      req.headers.authorization &&
      typeof req.headers.authorization === 'string' &&
      req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
      return req.headers.authorization.split(' ')[1];
    }
    return null;
  }
<<<<<<< HEAD
}).unless({
  // Routes that don't require authorization
  path: [
    '/',
    '/validate-captcha',
    { url: '/users', methods: ['POST', 'GET'] },
    '/users/ota-codes',
    { url: /\/users\/[0-z,.,-]+\/profile/i, methods: ['GET'] },
    { url: '/users/tokens', methods: ['POST'] },
    'validate-captcha',
    '/users/identifiers/active',
    '/users/organizations',
    '/users/verifyorganization'

  ]
}); // register & search // all ota-code routes do their own verification outsides of JWT // login
=======
});
>>>>>>> master
