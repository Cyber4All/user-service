import {
  DataStore,
  Responder,
  HashInterface,
  MailerInteractorInterface
} from '../interfaces/interfaces';
import { User } from '@cyber4all/clark-entity';
import { TokenManager } from '../drivers/drivers';

export class UserInteractor {
  public static async verifyEmail(
    dataStore: DataStore,
    email: string
  ): Promise<User> {
    try {
      let userID = await dataStore.findUser(email);
      await dataStore.editUser(userID, { emailVerified: true });
      let user = await dataStore.loadUser(userID);
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
      let pwdhash = await hasher.hash(password);
      let userID = await dataStore.findUser(email);
      await dataStore.editUser(userID, { pwdhash: pwdhash });
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
      let userID = await dataStore.findUser(username);
      let user = await dataStore.editUser(userID, edits);
      responder.setCookie('presence', TokenManager.generateToken(user));
    } catch (e) {
      responder.sendOperationError(e);
    }
  }
}
