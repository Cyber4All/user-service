import 'dotenv/config';
import * as jwt from 'jsonwebtoken';
import { UserToken } from './typings/user-token';

const SECRET_KEY = process.env.KEY;

/**
 * Converts user token to jwt string
 *
 * @export
 * @param {UserToken} userToken [The requester's token data to be encoded]
 * @param {(number | string)} expiration [Expiration time of the jwt. 60, "2 days", "10h", "7d". A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").]
 * @returns {string}
 */
export function encodeToken(userToken: UserToken): string {
  return jwt.sign(userToken, SECRET_KEY);
}
