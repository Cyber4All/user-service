import { UserToken } from '../../shared/typings';
import { GetOpenIdTokenForDeveloperIdentityResponse } from 'aws-sdk/clients/cognitoidentity';

export { UserToken };

export type OpenIdToken = GetOpenIdTokenForDeveloperIdentityResponse;
