export abstract class CognitoIdentityGateway{
    /**
     * Retrieves the Cognito Identity Id associated with the given username
     *
     * @abstract
     * @param {string} username [The username to fetch associated Cognito Identity Id for]
     * @param {string} isAdminOrEditor [Boolean indicating whether or not the user is an admin or editor]
     *
     * @returns {Promise<string>}
     * @memberof CognitoIdentityGateway
     */
  abstract getCognitoIdentityId(params: {username: string, isAdminOrEditor?: boolean}): Promise<string>;
}
