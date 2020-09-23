import { DataStore, HashInterface } from './../interfaces/interfaces';
import { TokenManager } from '../drivers/drivers';
import { sanitizeText } from './UserInteractor';
import { AuthUser } from '../shared/typings/auth-user';
import { UserToken } from '../shared/typings/user-token';
import { ResourceError, ResourceErrorReason, handleError } from '../Error';
import { OpenIdToken } from '../CognitoIdentityManager/typings';
import { mapUserDataToAuthUser } from '../shared/functions';
import { userIsAdminOrEditor } from '../shared/AuthorizationManager';
import { HttpFileAccessIdentityGateway } from '../gateways/file-access-identities/HttpFileAccessIdentityGateway';

export interface CognitoGateway {
  /**
   * Retrieves the Cognito OpenId Token associated with the given username
   *
   * @abstract
   * @param {string} username [The username to fetch associated Cognito Identity]
   * @param {string} isAdminOrEditor [Boolean indicating whether or not the user is an admin or editor]
   *
   * @returns {Promise<string>}
   * @memberof CognitoIdentityGateway
   */
  getOpenIdToken(params: { username: string, isAdminOrEditor?: boolean }): Promise<OpenIdToken>;
}

/**
 * Attempts user login via datastore and issues JWT access token
 * If credentials valid sends user with token
 * Else sends invalidLogin Response via Responder
 *
 * @export
 * @param {DataStore} dataStore
 * @param {Responder} responder
 * @param {string} username
 * @param {string} password
 */
export async function login(
  dataStore: DataStore,
  hasher: HashInterface,
  username: string,
  password: string,
  cognitoGateway: CognitoGateway
): Promise<{ bearer: string; openId: OpenIdToken; user: AuthUser }> {
  const invalidCredentialsError = new ResourceError(
    'Invalid username or password',
    ResourceErrorReason.BAD_REQUEST
  );
  try {
    const userName = sanitizeText(username);
    const id = await dataStore.findUser(userName);
    if (!id) {
      throw invalidCredentialsError;
    }

    const user = await dataStore.loadUser(id);
    const authenticated = await hasher.verify(password, user.password);
    if (!authenticated) {
      throw invalidCredentialsError;
    }
    const bearer = TokenManager.generateBearerToken(user);
    const openId = await cognitoGateway.getOpenIdToken({
      username: user.username,
      isAdminOrEditor: userIsAdminOrEditor(user)
    });
    delete user.password;
    return { bearer, openId, user };
  } catch (e) {
    handleError(e);
  }
}

/**
 * Attempt user registration via datastore and issues JWT access token
 * If username is unique sends user with access token
 * Else sends invalidRegistration Response via Responder
 *
 * @export
 * @param {DataStore} datastore
 * @param {Responder} responder
 * @param {User} user
 */
export async function register(
  datastore: DataStore,
  hasher: HashInterface,
  user: AuthUser,
  cognitoGateway: CognitoGateway
): Promise<{ bearer: string; openId: OpenIdToken; user: AuthUser }> {
  try {
    const formattedUser = sanitizeUser(user);
    formattedUser.accessGroups = [];

    if (!isValidUsername(formattedUser.username)) {
      throw new ResourceError(
        'Invalid username provided.',
        ResourceErrorReason.BAD_REQUEST
      );
    }

    if (await datastore.identifierInUse(formattedUser.username)) {
      throw new ResourceError(
        'Username is already in use',
        ResourceErrorReason.BAD_REQUEST
      );
    }

    if (await datastore.identifierInUse(formattedUser.email)) {
      throw new ResourceError(
        'Email address is already in use',
        ResourceErrorReason.BAD_REQUEST
      );
    }

    validatePassword(formattedUser.password);

    const pwdhash = await hasher.hash(formattedUser.password);
    user.password = pwdhash;

    const id = await datastore.insertUser(formattedUser);
    user.id = id;

    const bearer = TokenManager.generateBearerToken(user);
    const openId = await cognitoGateway.getOpenIdToken({
      username: user.username,
      isAdminOrEditor: userIsAdminOrEditor(user)
    });

    await HttpFileAccessIdentityGateway.createFileAccessIdentity({
      fileAccessIdentity: openId.IdentityId,
      username: user.username,
    });

    delete formattedUser.password;
    return {
      bearer,
      openId,
      user: mapUserDataToAuthUser(formattedUser)
    };
  } catch (e) {
    handleError(e);
  }
}

/**
 * Attempts to find the user via username and
 * and checks to see if the provided password is correct.
 *
 * @export
 * @param {DataStore} dataStore
 * @param {Responder} responder
 * @param {string} username
 * @param {string} password
 */
export async function passwordMatch(
  dataStore: DataStore,
  hasher: HashInterface,
  username: string,
  password: string
) {
  try {
    const userName = sanitizeText(username);
    const id = await dataStore.findUser(userName);
    const user = await dataStore.loadUser(id);
    const authenticated = await hasher.verify(password, user.password);
    if (authenticated) {
      return true;
    }
    return false;
  } catch (e) {
    console.log(e);
    return Promise.reject(`Could not perform password match. Error:${e}`);
  }
}

/**
 * Returns latest token and user object
 *
 * @export
 * @param {{
 *   dataStore: DataStore;
 *   requester: UserToken;
 * }} params
 * @returns {Promise<{ bearer: string; openId: OpenIdToken; user: AuthUser }>}
 */
export async function refreshToken({
  dataStore,
  requester,
  cognitoGateway
}: {
  dataStore: DataStore;
  requester: UserToken;
  cognitoGateway: CognitoGateway;
}): Promise<{ bearer: string; openId: OpenIdToken; user: AuthUser }> {
  try {
    const user = await dataStore.loadUser(requester.id);
    const bearer = TokenManager.generateBearerToken(user);
    const openId = await cognitoGateway.getOpenIdToken({
      username: user.username,
      isAdminOrEditor: userIsAdminOrEditor(user)
    });
    delete user.password;
    return { bearer, openId, user };
  } catch (e) {
    handleError(e);
  }
}

function sanitizeUser(user: AuthUser): AuthUser {
  user.username = sanitizeText(user.username);
  user.email = sanitizeText(user.email);
  user.name = sanitizeText(user.name);
  user.organization = sanitizeText(user.organization);
  user.bio = sanitizeText(user.bio, false);
  return user;
}

/**
 * Validates that a username meets the defined constraints.
 *
 * Constraints:
 * - 20 characters or less
 * - 3 characters or more
 * @param username the username being validated
 * @returns {boolean} whether or not the username is valid.
 */
export function isValidUsername(username: string): boolean {
  return username.length <= 20 && username.length >= 3;
}

/**
 * Validates that a password meets the defined constraints.
 * 
 * Constraints:
 * - At least 8 characters long
 * - Contains 1 letter
 * - Contains 1 capital letter
 * - Contains 1 number 
 * - Contains 1 symbol
 * 
 * @param password the password to be validated
 */
export function validatePassword(password: string): void {
  if(password.length < 8) {
    throw new ResourceError(
      'Password is less than 8 characters',
      ResourceErrorReason.BAD_REQUEST
    );
  } else {
    const letter = password.match(/[a-z]/g);
    const capitalLetter = password.match(/[A-Z]/g);
    const number = password.match(/[0-9]+/g);
    const symbol = password.match(/[@.,#$=%&-/:-?{-~!"^_`\[\]\(\)\*\+\\]/g);

    if (!letter || !capitalLetter || !number || !symbol) {
      throw new ResourceError(
        'Password is not valid. Must contain at least 1 letter, 1 capital letter, 1 number and 1 symbol',
        ResourceErrorReason.BAD_REQUEST
      )
    }
  }
}
