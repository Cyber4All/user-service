import * as rp from 'request-promise';
import { DataStore } from "../interfaces/interfaces";
import { User } from '@cyber4all/clark-entity';
export const AUTHENTICATE = '/authenticate';
export const ADD_USER = '/addUser';
export const CHECK_EMAIL_REGISTERED = '/emailRegistered';
export const FIND_USER = '/findUser';
export const LOAD_USER = '/loadUser';
export const EDIT_USER = '/editUser';
export const DB_INTERACTION_URI = 'http://52.206.44.129:27016';
export const LO_SUGGESTION_URI = 'http://54.92.208.221:27015';

// FIXME: Connect directly to a users db instead of db-interaction and its monolith
export default class MongoDriver implements DataStore {
  /**
   * Registers new user
   * If username unique new user is created; Unserialized User Object is returned
   *
   * @param {username: string, firstname: string, lastname: string, email: string, password: string} user
   * @returns {Promise<User>}
   * @memberof DatabseInteractionConnector
   */
  async register(user: { username: string, firstname: string, lastname: string, email: string, password: string }): Promise<User> {
    let newUser = new User(
      user.username,
      `${user.firstname} ${user.lastname}`,
      user.email,
      user.password
    );
    let emailRegistered = await this.request(DB_INTERACTION_URI, CHECK_EMAIL_REGISTERED, { email: user.email });
    if (emailRegistered) return Promise.reject('email');

    let userid = await this.request(DB_INTERACTION_URI, ADD_USER, { user: User.serialize(newUser) });
    if (userid && !userid.error) {
      let user = await this.request(DB_INTERACTION_URI, LOAD_USER, { id: userid });
      if (user && !user.error) {
        return User.unserialize(user);
      }
      return Promise.reject(user.error);
    }
    return Promise.reject(userid.error);
  }

  /**
   * Authenticates user via credentials
   * If credentials valid and user exists; Unserialized User Object is returned
   *
   * @param {string} username user's username
   * @param {string} password user's password
   * @returns {Promise<User>} Promise of User object in DB or null
   * @memberof DatabseInteractionConnector
   */
  async login(username: string, password: string): Promise<User> {
    let authenticated = await this.request(DB_INTERACTION_URI, AUTHENTICATE, { userid: username, pwd: password });
    if (authenticated && !authenticated.error) {
      let userid = await this.request(DB_INTERACTION_URI, FIND_USER, { userid: username });
      if (userid && !userid.error) {
        let user = await this.request(DB_INTERACTION_URI, LOAD_USER, { id: userid });
        if (user && !user.error) {
          return User.unserialize(user);
        }
        return null;
      }
      return null;
    }
    return null;
  }

  private async request(URI: string, event: string, params: {}): Promise<any> {
    return rp({
      method: 'POST',
      uri: URI + event,
      body: params,
      json: true,
    });
  }
}