import {
  DataStore,
  Responder,
  HashInterface,
  MailerInteractorInterface
} from '../interfaces/interfaces';
import { User } from '@cyber4all/clark-entity';
import { TokenManager } from '../drivers/drivers';
import { UserQuery } from '../interfaces/Query';

export class UserInteractor {
  public static async searchUsers(
    dataStore: DataStore,
    query: UserQuery
  ): Promise<User[]> {
    try {
      let users = await dataStore.searchUsers(query);
      users = users.map(user => {
        user.password = undefined;
        return user;
      });
      return users;
    } catch (e) {
      return Promise.reject(`Problem searching users. Error: ${e}`);
    }
  }

  public static async findUser(
    dataStore: DataStore,
    username: string
  ): Promise<User> {
    try {
      const userID = await dataStore.findUser(username);
      const user = await dataStore.loadUser(userID);
      user.password = undefined;
      return user;
    } catch (error) {
      return Promise.reject(`Problem finding specified user. Error: ${error}`);
    }
  }

  public static async verifyEmail(
    dataStore: DataStore,
    responder: Responder,
    email: string
  ): Promise<User> {
    try {
      const userID = await dataStore.findUser(email);
      await dataStore.editUser(userID, { emailVerified: true });
      const user = await dataStore.loadUser(userID);
      user.password = undefined;
      responder.setCookie('presence', TokenManager.generateToken(user));
      return user;
    } catch (e) {
      return Promise.reject(`Problem verifying email. Error: ${e}`);
    }
  }
  public static async updatePassword(
    dataStore: DataStore,
    hasher: HashInterface,
    email: string,
    password: string
  ): Promise<User> {
    try {
      const pwdhash = await hasher.hash(password);
      const userID = await dataStore.findUser(email);
      const user = await dataStore.editUser(userID, { password: pwdhash });
      user.password = undefined;
      return user;
    } catch (e) {
      return Promise.reject(`Problem updating password. Error:${e}`);
    }
  }

  public static async editInfo(
    dataStore: DataStore,
    responder: Responder,
    username: string,
    edits: {}
  ): Promise<void> {
    try {
      const userID = await dataStore.findUser(username);
      const user = await dataStore.editUser(userID, edits);
      user.password = undefined;
      responder.setCookie('presence', TokenManager.generateToken(user));
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public static async identifierInUse(
    dataStore: DataStore,
    username: string
  ): Promise<{ inUse: boolean }> {
    try {
      const inUse = await dataStore.identifierInUse(username);
      return { inUse };
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
