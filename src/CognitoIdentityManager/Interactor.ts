import 'dotenv/config';
import * as AWS from 'aws-sdk';
import { UserToken } from './typings';
import { handleError, ResourceError, ResourceErrorReason } from '../Error';
import {
  authorizeRequest,
  requesterIsOwner,
  requesterIsAdminOrEditor
} from './AuthorizationManager';

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

/**
 * Retrieves OpenIdToken for user
 *
 * *** Requester must be the owner of the resource to request OpenIdToken. ***
 *
 * @export
 * @param {UserToken} requester [Data about the requester]
 * @param {string} userId [Id of the user to get OpenIdToken for]
 *
 * @returns {Promise<AWS.CognitoIdentity.GetOpenIdTokenForDeveloperIdentityResponse>}
 */
export function getOpenIdToken({
  requester,
  userId
}: {
  requester: UserToken;
  userId: string;
}): Promise<AWS.CognitoIdentity.GetOpenIdTokenForDeveloperIdentityResponse> {
  try {
    authorizeRequest([requesterIsOwner({ requester, userId })]);
    validateRequestParams({
      params: [userId],
      mustProvide: ['user id']
    });
    const Logins = {};
    Logins[DEVELOPER_PROVIDER] = requester.username;

    const IdentityPoolId = requesterIsAdminOrEditor(requester)
      ? ADMIN_IDENTITY_POOL_ID
      : IDENTITY_POOL_ID;
    const params = {
      Logins,
      IdentityPoolId
    };
    return Cognito.getOpenIdTokenForDeveloperIdentity(params).promise();
  } catch (e) {
    handleError(e);
  }
}

/**
 * Validates all required values are provided for request
 *
 * @param {any[]} params
 * @param {string[]} [mustProvide]
 * @returns {(void | never)}
 */
function validateRequestParams({
  params,
  mustProvide
}: {
  params: any[];
  mustProvide?: string[];
}): void | never {
  const values = [...params].map(val => {
    if (typeof val === 'string') {
      val = val.trim();
    }
    return val;
  });
  if (
    values.includes(null) ||
    values.includes('null') ||
    values.includes(undefined) ||
    values.includes('undefined') ||
    values.includes('')
  ) {
    const multipleParams = mustProvide.length > 1;
    let message = 'Invalid parameters provided';
    if (Array.isArray(mustProvide)) {
      message = `Must provide ${multipleParams ? '' : 'a'} valid value${
        multipleParams ? 's' : ''
      } for ${mustProvide}`;
    }
    throw new ResourceError(message, ResourceErrorReason.BAD_REQUEST);
  }
}
