import { UserInteractor } from './interactors';
import { DataStore } from '../interfaces/DataStore';
import { User } from '@cyber4all/clark-entity';

export class AdminUserInteractor {
  private static userInteractor = UserInteractor;
  /**
   * Fetches all Users
   *
   * @static
   * @param {DataStore} dataStore
   * @param {*} query
   * @returns {Promise<User[]>}
   * @memberof AdminUserInteractor
   */
  public static async fetchUsers(
    dataStore: DataStore,
    query: any
  ): Promise<User[]> {
    try {
      const users = await this.userInteractor.searchUsers(dataStore, query);
      return Promise.all(
        users.map(async user => {
          user.id = await dataStore.findUser(user.username);
          return user;
        })
      );
    } catch (e) {
      return Promise.reject(`Problem fetching users. Error: ${e}`);
    }
  }
  /**
   * Deletes User Account
   *
   * @static
   * @param {DataStore} dataStore
   * @param {string} id
   * @returns {Promise<void>}
   * @memberof AdminUserInteractor
   */
  public static async deleteUser(
    dataStore: DataStore,
    id: string
  ): Promise<void> {
    try {
      await dataStore.deleteUser(id);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(`Problem fetching users. Error: ${e}`);
    }
  }
}
