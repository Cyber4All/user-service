import {
  DataStore,
  Responder,
  HashInterface,
  MailerInteractorInterface
} from '../interfaces/interfaces';
import { User } from '@cyber4all/clark-entity';
import { TokenManager } from '../drivers/drivers';

export class UserInteractor {
  public static async searchUsers(
    dataStore: DataStore,
    query: {}
  ): Promise<User[]> {
    try {
      const users = await dataStore.searchUsers(query);
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
      responder.setCookie('presence', TokenManager.generateToken(user));
      return user;
    } catch (e) {
      return Promise.reject(`Problem verifing email. Error: ${e}`);
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
      delete user.password;
      return user;
    } catch (e) {
      return Promise.reject(`Problem updating password. Erro:${e}`);
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
      responder.setCookie('presence', TokenManager.generateToken(user));
      responder.sendOperationSuccess();
    } catch (e) {
      responder.sendOperationError(e);
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
