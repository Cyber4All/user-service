import { Request } from 'express';

/**
 * Returns Bearer token from authorization header.
 *
 * @export
 * @param {string} authHeader
 * @returns {string}
 */
export function getBearerToken(authHeader: string): string {
  let token;
  const [type, tokenVal] = authHeader ? authHeader.split(' ') : [null, null];
  if (
    type === 'Bearer' &&
    tokenVal &&
    tokenVal !== 'null' &&
    tokenVal !== 'undefined'
  ) {
    token = tokenVal;
  }
  return token;
}

/**
 * Returns string token from cookie or header
 *
 * @export
 * @param {Request} req
 * @returns {string}
 */
export function getToken(req: Request): string {
  if (req.cookies && req.cookies.presence) {
    return req.cookies.presence;
  }
  return getBearerToken(req.headers.authorization);
}
