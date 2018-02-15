import { DataStore, Responder, User } from './../interfaces/interfaces';
import { TokenManager } from '../drivers/drivers';


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
export async function login(dataStore: DataStore, responder: Responder, username: string, password: string) {
  // Try to login with the datastore
  // response should be the user object
  dataStore.login(username, password)
    .then((user) => {
      // Get access token and add to user object
      user['token'] = TokenManager.generateToken(user);
      // Clean user object for safe local storage in the client
      delete user.id;
      responder.sendUser(user);
    })
    .catch((error) => {
      console.log(error);
      responder.invalidLogin();
    });
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
export async function register(datastore: DataStore, responder: Responder, user) {
  // Try register with datastore
  // response should be the user object
  datastore.register(user)
    .then((newUser) => {
      // Get access token and add to user object
      newUser['token'] = TokenManager.generateToken(newUser);
      delete newUser.id;
      responder.sendUser(newUser);
    })
    .catch((error) => {
      console.log(error);
      // Clean user object for safe local storage in the client
      if (error === 'email') {
        responder.sendOperationError('Email is already in use.', 420);
      } else {
        responder.invalidRegistration();

      }
    });
}

export async function validateToken(responder: Responder, token: string) {
  if (!TokenManager.verifyJWT(token, responder, null)) {
    responder.invalidAccess();
  } else {
    responder.sendOperationSuccess();
  }
}

