import * as jwt from 'jsonwebtoken';
import { key, issuer } from '../environment/config';

/**
 * Takes a user object and generates a JWT for the user
 * @param user contains the user's id, username, firstname, lastname, and email
 */
export function generateToken(user) {
  const payload = {
    username: user.username,
    name: user.name,
    email: user.email,
    organization: user.organization,
  };
  const options = {
    issuer,
    expiresIn: 86400,
    audience: user.username
  };
  const token = jwt.sign(payload, key, options);
  return token;
}

/**
 * Accepts a JWT and verifies that the token has been properly issued
 *
 * @param token the JWT as a string
 * @param callback the function to execute after verification
 */
export function verifyJWT(token, res, callback): boolean {
  try {
    const decoded = jwt.verify(token, key, {});

    if (typeof callback === 'function') {
      callback(status, decoded);
    }

    return true;
  } catch (error) {
    return false;
  }
}
