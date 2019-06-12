import { UserToken } from '../../types/user-token';
import { GetOpenIdTokenForDeveloperIdentityResponse } from 'aws-sdk/clients/cognitoidentity';

export { UserToken };

export type OpenIdToken = GetOpenIdTokenForDeveloperIdentityResponse;
