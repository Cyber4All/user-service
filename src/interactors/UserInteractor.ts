import { DataStore, Responder, HashInterface } from '../interfaces/interfaces';
import { User } from '@cyber4all/clark-entity';
import { TokenManager } from '../drivers/drivers';
import { UserQuery } from '../interfaces/Query';

export class UserInteractor {
  public static async searchUsers(
    dataStore: DataStore,
    query: UserQuery
  ): Promise<User[]> {
    try {
      for (const key of Object.keys(query).filter(
        key => typeof query[key] === 'string'
      )) {
        query[key] = sanitizeText(query[key]);
      }
      const response = await dataStore.searchUsers(query);
      const users = response.users.map(user => {
        user.password = undefined;
        delete user.accessGroups;
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
  ): Promise<string> {
    try {
      const userName = sanitizeText(username);
      return dataStore.findUser(userName);
    } catch (error) {
      return Promise.reject(`Problem finding specified user. Error: ${error}`);
    }
  }

  public static async loadUser(
    dataStore: DataStore,
    username: string
  ): Promise<User> {
    try {
      const userName = sanitizeText(username);
      const userID = await this.findUser(dataStore, userName);
      const user = await dataStore.loadUser(userID);
      user.password = undefined;
      delete user.accessGroups;
      return user;
    } catch (error) {
      return Promise.reject(`Problem finding specified user. Error: ${error}`);
    }
  }

  public static async verifyEmail(
    dataStore: DataStore,
    email: string
  ): Promise<User> {
    try {
      const eMail = sanitizeText(email);
      const userID = await dataStore.findUser(eMail);
      await dataStore.editUser(userID, { emailVerified: true });
      const user = await dataStore.loadUser(userID);
      user.password = undefined;
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
      const eMail = sanitizeText(email);
      const pwdhash = await hasher.hash(password);
      const userID = await dataStore.findUser(eMail);
      const user = await dataStore.editUser(userID, { password: pwdhash });
      user.password = undefined;
      delete user.accessGroups;

      return user;
    } catch (e) {
      return Promise.reject(`Problem updating password. Error:${e}`);
    }
  }

  public static async editInfo(
    dataStore: DataStore,
    responder: Responder,
    hasher: HashInterface,
    username: string,
    edits: any
  ): Promise<void> {
    try {
      const userEdits = {
        name: sanitizeText(edits.name),
        email: sanitizeText(edits.email),
        organization: sanitizeText(edits.organization),
        bio: sanitizeText(edits.bio, false)
      };
      const userName = sanitizeText(username);
      const userID = await dataStore.findUser(userName);
      const user = await dataStore.editUser(userID, userEdits);
      if (edits.password) {
        this.updatePassword(dataStore, hasher, userName, edits.password);
      }
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
      const userName = sanitizeText(username);
      const inUse = await dataStore.identifierInUse(userName);
      return { inUse };
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public static async findOrganizations(
    dataStore: DataStore,
    query: string
  ): Promise<any[]> {
    try {
      const orgs = await dataStore.findOrganizations(query);
      return orgs;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public static async deleteUser(
    dataStore: DataStore,
    username: string
  ): Promise<void> {
    try {
      const userName = sanitizeText(username);
      const id = await this.findUser(dataStore, userName);
      return dataStore.deleteUser(id);
    } catch (e) {
      return Promise.reject(`Unable to delete user. Error: ${e}`);
    }
  }
}

/**
 * Formats text properly for usage in DataStore
 *
 * @export
 * @param {string} text
 * @param {boolean} [lowerCase=true]
 * @returns {string}
 */
export function sanitizeText(text: string, lowerCase = true): string {
  let clean = text;
  if (clean) {
    if (lowerCase) {
      clean = clean.toLowerCase();
    }
    clean.trim();
  }

  return clean;
}
