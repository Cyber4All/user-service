import { DataStore } from '../interfaces/interfaces';
import { OTACode } from './OTACodeManager';
import { UserQuery } from '../interfaces/Query';
import { MOCK_OBJECTS } from '../tests/mocks';
import { UserStats } from '../UserStats/UserStatsInteractor';
import { UserDocument } from '../shared/typings/user-document';
import { User } from '../shared/typings';

export default class MockDriver implements DataStore {
  fetchUserCollectionRole(params: {
    userId: string;
    collection: string;
  }): Promise<string> {
    return Promise.resolve(MOCK_OBJECTS.ROLE);
  }

  connect(dbURI: string): Promise<void> {
    return Promise.resolve();
  }

  disconnect(): void {
    return;
  }

  async identifierInUse(username: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  insertUser(user: User): Promise<string> {
    return Promise.resolve(MOCK_OBJECTS.USER_ID);
  }

  async findUser(username: string): Promise<string> {
    return Promise.resolve(MOCK_OBJECTS.USER_ID);
  }

  async loadUser(id: string): Promise<any> {
    return Promise.resolve(MOCK_OBJECTS.USER);
  }

  async editUser(id: string, user: {}): Promise<any> {
    return Promise.resolve(MOCK_OBJECTS.USER);
  }

  deleteUser(id: string): Promise<void> {
    return Promise.resolve();
  }

  insertOTACode(otaCode: OTACode): Promise<void> {
    return Promise.resolve();
  }

  async findOTACode(otaCode: string): Promise<string> {
    return Promise.resolve(MOCK_OBJECTS.OTACODE_ID);
  }

  deleteOTACode(id: string): Promise<void> {
    return Promise.resolve();
  }

  searchUsers(query: UserQuery): Promise<{ users: any[]; total: number }> {
    return Promise.resolve({
      users: [MOCK_OBJECTS.USER],
      total: MOCK_OBJECTS.SEARCH_COUNT
    });
  }

  fetchReviewers(collection: string): Promise<any[]> {
    return Promise.resolve([MOCK_OBJECTS.USER]);
  }

  fetchCurators(collection: string): Promise<any[]> {
    return Promise.resolve([MOCK_OBJECTS.USER]);
  }

  fetchCollectionMembers(collection: string): Promise<any[]> {
    return Promise.resolve([MOCK_OBJECTS.USER]);
  }

  findUserById(userId: string): Promise<UserDocument> {
    return Promise.resolve(MOCK_OBJECTS.MODIFY_ROLE_USER);
  }

  assignAccessGroup(
    userId: string,
    formattedAccessGroup: string
  ): Promise<void> {
    return Promise.resolve();
  }

  editAccessGroup(
    userId: string,
    formattedAccessGroup: string,
    collection: string
  ): Promise<void> {
    return Promise.resolve();
  }

  removeAccessGroup(
    userId: string,
    formattedAccessGroup: string
  ): Promise<void> {
    return Promise.resolve();
  }

  fetchStats(params: { query: any }): Promise<UserStats> {
    return Promise.resolve(MOCK_OBJECTS.USER_STATS);
  }

  async findOrganizations(query: string): Promise<any[]> {
    return Promise.resolve([MOCK_OBJECTS.ORGANIZATION]);
  }
}
