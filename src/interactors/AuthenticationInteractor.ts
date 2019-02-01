import { DataStore, HashInterface } from './../interfaces/interfaces';
import { TokenManager } from '../drivers/drivers';
import { User } from '@cyber4all/clark-entity';
import { sanitizeText } from './UserInteractor';
import { AuthUser } from '../types/auth-user';
import { reportError } from '../drivers/SentryConnector';

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
): Promise<boolean | { token: string; user: User }> {
  try {
    let id;
    let authenticated = false;
    const userName = sanitizeText(username);
    try {
      id = await dataStore.findUser(userName);
    } catch (e) {
      console.error(e);
      return authenticated;
    }

    const user = await dataStore.loadUser(id);
    authenticated = await hasher.verify(password, user.password);

    if (authenticated) {
      const token = TokenManager.generateToken(user);
      return { token, user: new User(user) };
    }
    return authenticated;
  } catch (e) {
    console.log(e);
    return Promise.reject(`Problem while trying to login. Error:${e}`);
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
): Promise<{ token: string; user: User }> {
  try {
    const username = sanitizeText(user.username);
    if (
      isValidUsername(username) &&
      !(await datastore.identifierInUse(username))
    ) {
      const pwdhash = await hasher.hash(user.password);
      user.password = pwdhash;
      const formattedUser = sanitizeUser(user);
      await datastore.insertUser(formattedUser);
      const token = TokenManager.generateToken(user);
      return { token, user: new User(formattedUser) };
    }
    return Promise.reject(new Error('Invalid username provided'));
  } catch (e) {
    if (e.message.includes('email')) {
      return Promise.reject(new Error('Duplicate/Invalid Email Found'))
    }
    else {
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
 *   username: string;
 * }} params
 * @returns {Promise<{ token: string; user: User }>}
 */
export async function refreshToken(params: {
  dataStore: DataStore;
  username: string;
}): Promise<{ token: string; user: User }> {
  const id = await params.dataStore.findUser(params.username);
  const user = await params.dataStore.loadUser(id);
  const token = TokenManager.generateToken(user);
  return { token, user: new User(user) };
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
