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

  public static async findUser(
    dataStore: DataStore,
    responder: Responder,
    username: string
  ): Promise<User> {
    try {
      const userID = await dataStore.findUser(username);
      const user = await dataStore.loadUser(userID);
      return user; 
    } catch (error) {
      responder.sendOperationError(
        `Problem finding specified user. Error: ${error}`
      );
      return undefined;
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
    hasher: HashInterface,
    email: string,
    password: string
  ): Promise<void> {
    try {
      const pwdhash = await hasher.hash(password);
      const userID = await dataStore.findUser(email);
      await dataStore.editUser(userID, { password: pwdhash });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public static async editInfo(
    dataStore: DataStore,
    responder: Responder,
    hasher: HashInterface,
    username: string,
    edits: {}
  ): Promise<void> {
    try {
      const userEdits = {
        name: edits.name,
        email: edits.email,
        organization: edits.organization,
        bio: edits.bio
      }
      const userID = await dataStore.findUser(username);
      const user = await dataStore.editUser(userID, userEdits);
      if (edits.password !== '') {
        this.updatePassword (
          dataStore,
          hasher,
          username,
          edits.password
        );
      }
      responder.setCookie('presence', TokenManager.generateToken(user));
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public static async identifierInUse(
    dataStore: DataStore,
    responder: Responder,
    username: string
  ): Promise<void> {
    try {
      const inUse = await dataStore.identifierInUse(username);
      responder.sendObject({ inUse });
    } catch (e) {
      responder.sendOperationError(e);
    }
  }
}
