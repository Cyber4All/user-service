import { UserInteractor } from './interactors';
import { DataStore } from '../interfaces/DataStore';
import { User } from '@cyber4all/clark-entity';

export class AdminUserInteractor {
  private static userInteractor = UserInteractor;

  public static async fetchUsers(
    dataStore: DataStore,
    query: any
  ): Promise<User[]> {
    try {
      return this.userInteractor.searchUsers(dataStore, query);
    } catch (e) {
      return Promise.reject(`Problem fetching users. Error: ${e}`);
    }
  }
}
