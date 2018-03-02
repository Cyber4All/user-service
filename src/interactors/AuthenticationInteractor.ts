import {
  DataStore,
  Responder,
  HashInterface,
  Mailer
} from './../interfaces/interfaces';
import { TokenManager, OTACodeManager } from '../drivers/drivers';
import { User } from '@cyber4all/clark-entity';
import { ACCOUNT_ACTIONS } from '../interfaces/Mailer.defaults';

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
    let id = await dataStore.findUser(username);
    let user = await dataStore.loadUser(id);
    let authenticated = await hasher.verify(password, user.pwd);

    if (authenticated) {

      responder.setCookie('presence', TokenManager.generateToken(user));
      responder.sendUser(user);
    } else {
      responder.invalidLogin();
    }
  } catch (e) {
    console.log(e);
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
  _user: User
) {
  try {
    // FIXME: Needs consistent typing here
    let pwdhash = await hasher.hash(_user.pwd ? _user.pwd : _user["password"]);
    _user.pwd = pwdhash;
    let user = await datastore.insertUser({
      username: _user.username,
      name_: `${_user.firstname} ${_user.lastname}`,
      organization: _user.organization,
      email: _user.email,
      pwdhash: pwdhash,
      objects: []
    });
    user["token"] = TokenManager.generateToken(user);
    responder.setCookie('presence', user['token']);
    responder.sendOperationSuccess();
  } catch (e) {
    console.log(e);
    responder.sendOperationError(e);
  }
}

export async function validateToken(responder: Responder, token: string) {
  if (!TokenManager.verifyJWT(token, responder, null)) {
    responder.invalidAccess();
  } else {

    responder.sendOperationSuccess();
  }
}
