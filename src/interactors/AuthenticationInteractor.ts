import { DataStore, HashInterface } from './../interfaces/interfaces';
import { TokenManager } from '../drivers/drivers';
import { User } from '@cyber4all/clark-entity';
import { sanitizeText } from './UserInteractor';
import { AuthUser } from '../types/auth-user';
import { UserToken } from '../types/user-token';
import { reportError } from '../shared/SentryConnector';
import { CognitoIdentityManager } from '../CognitoIdentityManager';
import { OpenIdToken } from '../CognitoIdentityManager/typings';
import { ResourceError, ResourceErrorReason, handleError } from '../Error';

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
  password: string
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
    const bearer = TokenManager.generateToken(user);
    const requester: UserToken = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      organization: user.organization,
      emailVerified: user.emailVerified,
      accessGroups: user.accessGroups
    };
    const openId = await CognitoIdentityManager.getOpenIdToken({
      requester
    });

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
  user: AuthUser
): Promise<{ token: string; openId: OpenIdToken; user: AuthUser }> {
  try {
    if (
      isValidUsername(user.username) &&
      !(await datastore.identifierInUse(user.username))
    ) {
      const pwdhash = await hasher.hash(user.password);
      user.password = pwdhash;
      const formattedUser = sanitizeUser(user);
      formattedUser.accessGroups = [];
      const id = await datastore.insertUser(formattedUser);
      user.id = id;
      const token = TokenManager.generateToken(user);
      const requester: UserToken = {
        id,
        username: user.username,
        name: user.name,
        email: user.email,
        organization: user.organization,
        emailVerified: user.emailVerified,
        accessGroups: user.accessGroups
      };
      const openId = await CognitoIdentityManager.getOpenIdToken({
        requester
      });
      return {
        token,
        openId,
        user: new AuthUser(formattedUser.toPlainObject())
      };
    }
    return Promise.reject(new Error('Invalid username provided'));
  } catch (e) {
    if (e.message.includes('email')) {
      return Promise.reject(new Error('Duplicate/Invalid Email Found'));
    } else {
      reportError(e);
      return Promise.reject(new Error('Internal Server Error'));
    }
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
  requester
}: {
  dataStore: DataStore;
  requester: UserToken;
}): Promise<{ bearer: string; openId: OpenIdToken; user: AuthUser }> {
  try {
    const user = await dataStore.loadUser(requester.id);
    const bearer = TokenManager.generateToken(user);
    const newUserToken: UserToken = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      organization: user.organization,
      emailVerified: user.emailVerified,
      accessGroups: user.accessGroups
    };
    const openId = await CognitoIdentityManager.getOpenIdToken({
      requester: newUserToken
    });
    return { bearer, openId, user };
  } catch (e) {
    handleError(e);
  }
}

function sanitizeUser(user: AuthUser): AuthUser {
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
