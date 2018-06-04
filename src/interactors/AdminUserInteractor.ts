import { UserInteractor } from './interactors';
import { DataStore } from '../interfaces/DataStore';
import { User } from '@cyber4all/clark-entity';
import { UserQuery } from '../interfaces/Query';

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
    query: UserQuery
  ): Promise<{ users: User[]; total: number }> {
    try {
      const response = await dataStore.searchUsers(query);
      const users = await Promise.all(
        response.users.map(async user => {
          user.id = await dataStore.findUser(user.username);
          user.password = undefined;
          return user;
        })
      );
      return { users, total: response.total };
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
