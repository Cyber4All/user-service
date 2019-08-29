import * as jwt from 'jsonwebtoken';
import { ObjectID } from 'mongodb';
import { ACCOUNT_ACTIONS } from '../interfaces/Mailer.defaults';
import * as dotenv from 'dotenv';
dotenv.config();

// TODO: Create constructor that takes enviornment options so they can be injected by client instead of pulling from .env

const DEFAULT_EXP = '1h';

export interface OTACode {
  id: string;
  code: string;
}

export interface DecodedOTACode {
  data: any;
  action: ACCOUNT_ACTIONS;
}

/**
 * Generates unique OTA Code
 *
 * @export
 * @param {string} [expiresIn]
 * @returns {string}
 */
export function generate(
  payload: string | Object | Buffer,
  action: ACCOUNT_ACTIONS,
  expiresIn?: string
): Promise<OTACode> {
  const otaID = new ObjectID().toHexString();
  return new Promise<OTACode>((resolve, reject) => {
    jwt.sign(
      {
        action,
        data: payload
      },
      process.env.OTA_CODE_SECRET,
      {
        expiresIn: expiresIn ? expiresIn : DEFAULT_EXP,
        issuer: process.env.OTA_CODE_ISSUER,
        jwtid: otaID
      },
      (err, token) => {
        if (err) {
          reject(err);
        }
        const code = token.replace(
          process.env.TOKEN_REPLACER,
          process.env.OTA_CODE_REPLACEMENT
        );
        resolve({ code, id: otaID });
      }
    );
  });
}

/**
 * Verifies and decodes a OTA Code
 *
 * @export
 * @param {string} otaCode
 * @param {string} otaID
 * @param {ONE_TIME_ACTION} action
 * @returns {Promise<any>}
 */
export function decode(
  otaCode: string,
  otaID: string
): Promise<DecodedOTACode> {
  const code = otaCode.replace(
    process.env.OTA_CODE_REPLACER,
    process.env.TOKEN_REPLACMENT
  );
  return new Promise((resolve, reject) => {
    jwt.verify(
      code,
      process.env.OTA_CODE_SECRET,
      {
        issuer: process.env.OTA_CODE_ISSUER,
        jwtid: otaID
      },
      (err, decoded) => {
        err ? reject(err) : resolve(decoded as DecodedOTACode);
      }
    );
  });
}
