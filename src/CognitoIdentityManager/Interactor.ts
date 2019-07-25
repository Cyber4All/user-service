import 'dotenv/config';
import * as AWS from 'aws-sdk';
import {  OpenIdToken } from './typings';
import { handleError } from '../Error';


const SDK_CONFIG = {
  credentials: {
    accessKeyId: process.env.COGNITO_IAM_ACCESS_KEY_ID,
    secretAccessKey: process.env.COGNITO_IAM_SECRET_ACCESS_KEY
  },
  region: process.env.COGNITO_REGION
};

AWS.config.credentials = SDK_CONFIG.credentials;
AWS.config.region = SDK_CONFIG.region;

const Cognito = new AWS.CognitoIdentity();
const DEVELOPER_PROVIDER = process.env.COGNITO_DEVELOPER_PROVIDER;
const IDENTITY_POOL_ID = process.env.COGNITO_IDENTITY_POOL_ID;
const ADMIN_IDENTITY_POOL_ID = process.env.COGNITO_ADMIN_IDENTITY_POOL_ID;

const TOKEN_DURATION = 86400; // 24 hours in seconds

/**
 * Retrieves OpenIdToken for user
 *
 * @export
 * @param {string} username [The username to fetch associated Cognito Identity Id for]
 * @param {string} isAdminOrEditor [Boolean indicating whether or not the user is an admin or editor]
 *
 * @returns {Promise<OpenIdToken>}
 */
export function getOpenIdToken({username, isAdminOrEditor}:{username: string,isAdminOrEditor?: boolean}): Promise<OpenIdToken> {
  try {
    const Logins = {};
    Logins[DEVELOPER_PROVIDER] = username;

    const IdentityPoolId = isAdminOrEditor
      ? ADMIN_IDENTITY_POOL_ID
      : IDENTITY_POOL_ID;
    const params = {
      Logins,
      IdentityPoolId,
      TokenDuration: TOKEN_DURATION
    };
    return Cognito.getOpenIdTokenForDeveloperIdentity(params).promise();
  } catch (e) {
    handleError(e);
  }
}
