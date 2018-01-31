import * as rp from 'request-promise';
import { DataStore } from "../interfaces/interfaces";
import { User } from '@cyber4all/clark-entity';
export const AUTHENTICATE = '/authenticate';
export const ADD_USER = '/register';
export const CHECK_EMAIL_REGISTERED = '/emailRegistered';
export const FIND_USER = '/findUser';
export const LOAD_USER = '/loadUser';
export const EDIT_USER = '/editUser';
import * as dotenv from 'dotenv';
dotenv.config();

// FIXME: Connect directly to a users db instead of db-interaction and its monolith
export default class MongoDriver implements DataStore {
  /**
   * Registers new user
   * If username is unique, new user is created; Unserialized User Object is returned
   *
   * @param {username: string, firstname: string, lastname: string, email: string, password: string} user
   * @returns {Promise<User>}
   * @memberof DatabseInteractionConnector
   */
  async register(user: { username: string, firstname: string, lastname: string, email: string, password: string }): Promise<User> {
    console.log('register hit');
    let newUser = new User(
      user.username,
      `${user.firstname} ${user.lastname}`,
      user.email,
      user.password
    );
    console.log(user);
    let emailRegistered = await this.request(process.env.LEARNING_OBJECT_SERVICE_URI, CHECK_EMAIL_REGISTERED, { email: user.email });
    console.log(emailRegistered);
    if (emailRegistered) return Promise.reject('email');

    let registeredUser = await this.request(process.env.LEARNING_OBJECT_SERVICE_URI, ADD_USER, { user: User.serialize(newUser) });
    console.log(registeredUser);
    if (registeredUser && !registeredUser.error) {
      // FIXME: stabilize user serialization
      if (typeof (registeredUser) === "string") {
        return User.unserialize(registeredUser);
      } else return registeredUser;
    }
    return Promise.reject(registeredUser.error);
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
    let user = await this.request(process.env.LEARNING_OBJECT_SERVICE_URI, AUTHENTICATE, { username: username, pwd: password });
    console.log(user);
    if (user && !user.error) {
      if (typeof (user) === "string") {
        return User.unserialize(user);
      } else return user;
    } else return null;
  }

  private async request(URI: string, event: string, params: {}): Promise<any> {
    return rp({
      method: 'POST',
      uri: URI + 'api' + event,
      body: params,
      json: true,
    });
  }
}