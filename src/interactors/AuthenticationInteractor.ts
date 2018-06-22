import {
  DataStore,
  Responder,
  HashInterface,
  Mailer
} from './../interfaces/interfaces';
import { TokenManager, OTACodeManager } from '../drivers/drivers';
import { User } from '@cyber4all/clark-entity';
import { ACCOUNT_ACTIONS } from '../interfaces/Mailer.defaults';
import { sanitizeText } from './UserInteractor';

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
  responder: Responder,
  hasher: HashInterface,
  username: string,
  password: string
) {
  try {
    let id;
    const userName = sanitizeText(username);
    try {
      id = await dataStore.findUser(userName);
    } catch (e) {
      responder.invalidLogin();
      return;
    }

    const user = await dataStore.loadUser(id);
    const authenticated = await hasher.verify(password, user.password);
    delete user.password;

    if (authenticated) {
      const token = TokenManager.generateToken(user);
      responder.setCookie('presence', token);
      responder.sendUser(user);
    } else {
      responder.invalidLogin();
    }
  } catch (e) {
    responder.sendOperationError(e);
  }
}

export async function logout(dataStore: DataStore, responder: Responder) {
  responder.removeCookie('presence');
  responder.sendOperationSuccess();
}

/**
 * Attempt user registraction via datastore and issues JWT access token
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
  responder: Responder,
  hasher: HashInterface,
  user: User
) {
  try {
    if (
      isValidUsername(user.username) &&
      !await datastore.identifierInUse(user.username)
    ) {
      const pwdhash = await hasher.hash(user.password);
      user.password = pwdhash;
      const formattedUser = sanitizeUser(user);
      const userID = await datastore.insertUser(user);
      const token = TokenManager.generateToken(user);
      delete user.password;
      responder.setCookie('presence', token);
      responder.sendUser(user);
    } else {
      responder.sendOperationError('Invalid username provided.', 400);
    }
  } catch (e) {
    console.log(e);
    responder.sendOperationError(e);
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
  responder: Responder,
  hasher: HashInterface,
  username: string,
  password: string
) {
  try {
    const userName = sanitizeText(username);
    const id = await dataStore.findUser(userName);
    const user = await dataStore.loadUser(id);
    const authenticated = await hasher.verify(password, user.password);
    delete user.password;

    if (authenticated) {
      responder.sendPasswordMatch(true);
    } else {
      responder.sendPasswordMatch(false);
    }
  } catch (e) {
    responder.sendOperationError(e);
  }
}

function sanitizeUser(user: User): User {
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
