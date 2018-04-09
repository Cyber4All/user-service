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
    responder: Responder,
    query: {}
  ) {
    try {
      const users = await dataStore.searchUsers(query);
      responder.sendUser(users);
    } catch (e) {
      responder.sendOperationError(`Problem searching users. Error: ${e}`);
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
      return Promise.reject(e);
    }
  }
  public static async updatePassword(
    dataStore: DataStore,
    responder: Responder,
    hasher: HashInterface,
    email: string,
    password: string
  ) {
    try {
      const pwdhash = await hasher.hash(password);
      const userID = await dataStore.findUser(email);
      await dataStore.editUser(userID, { password: pwdhash });
      responder.sendOperationSuccess();
    } catch (e) {
      responder.sendOperationError(e);
    }
  }

  public static async editInfo(
    dataStore: DataStore,
    responder: Responder,
    username: string,
    edits: {}
  ) {
    try {
      const userID = await dataStore.findUser(username);
      const user = await dataStore.editUser(userID, edits);
      responder.setCookie('presence', TokenManager.generateToken(user));
      responder.sendOperationSuccess();
    } catch (e) {
      responder.sendOperationError(e);
    }
  }
}
