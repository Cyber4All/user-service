import { OTACode } from '../drivers/OTACodeManager';
import { UserQuery } from './Query';
import { UserStatDatastore } from '../UserStats/UserStatsInteractor';
import { AuthUser } from '../types/auth-user';
import { UserDocument } from '../types/user-document';

export interface DataStore extends UserStatDatastore {
  identifierInUse(username: string): Promise<boolean>;
  insertUser(user: AuthUser): Promise<string>;
  findUser(username: string): Promise<string>;
  loadUser(id: string): Promise<AuthUser>;
  editUser(id: string, user: { [index: string]: any }): Promise<AuthUser>;
  deleteUser(id: string): Promise<void>;
  insertOTACode(otaCode: OTACode): Promise<void>;
  findOTACode(otaCode: string): Promise<string>;
  deleteOTACode(id: string): Promise<void>;
  searchUsers(query: UserQuery): Promise<{ users: AuthUser[]; total: number }>;
  findOrganizations(query: string): Promise<any[]>;
  fetchReviewers(collection: string): Promise<any[]>;
  fetchCurators(collection: string): Promise<any[]>;
  fetchCollectionMembers(collection: string): Promise<any[]>;
  findUserById(userId: string): Promise<UserDocument>;
  fetchUserCollectionRole(params: {userId: string, collection: string}): Promise<string>;
  assignAccessGroup(userId: string, formattedAccessGroup: string): Promise<void>;
  editAccessGroup(
    userId: string,
    formattedAccessGroup: string,
    collection: string
  ): Promise<void>;
  removeAccessGroup(userId: string, formattedAccessGroup: string): Promise<void>;
}
