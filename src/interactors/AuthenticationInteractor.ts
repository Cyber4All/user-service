import { DataStore, Responder, HashInterface, Mailer } from './../interfaces/interfaces';
import { TokenManager } from '../drivers/drivers';
import { MailerInteractor } from './MailInteractor';
import { User } from '@cyber4all/clark-entity';

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
export async function login(dataStore: DataStore, responder: Responder, hasher: HashInterface, username: string, password: string) {
  try {
    let id = await dataStore.findUser(username);
    let user = await dataStore.loadUser(id);
    let authenticated = await hasher.verify(password, user.pwd);

    if (authenticated) {
      user['token'] = TokenManager.generateToken(user);
      responder.sendUser(user);
    } else {
      responder.invalidLogin();
    }
  } catch (e) {
    console.log(e);
    responder.sendOperationError(e);
  }
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
export async function register(datastore: DataStore, responder: Responder, hasher: HashInterface, _user: User) {
  try {
    let pwdhash = await hasher.hash(_user.pwd);
    await datastore.insertUser(_user);
    let user = new User(_user.username, _user.name, _user.email, _user.organization, null);
    user['token'] = TokenManager.generateToken(user);
    responder.sendUser(user);
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

export async function sendPasswordReset(datastore: DataStore, responder: Responder, mailer: MailerInteractor, email: string) {
  try {
    let emailValid = await datastore.emailRegistered(email);
    emailValid ? await mailer.sendPasswordReset(email)
      : responder.sendOperationSuccess();
    responder.sendOperationSuccess();
  } catch (e) {
    responder.sendOperationError(`Problem sending email. Error: ${e}`)
  }


}

