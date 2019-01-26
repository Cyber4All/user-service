import { OTACode } from '../drivers/OTACodeManager';
import { UserQuery } from './Query';
import { AuthUser } from '../types/auth-user';
import { UserStatDatastore } from '../UserStats/UserStatsInteractor';

export interface DataStore extends UserStatDatastore {
  connect(dbURI: string): Promise<void>;
  disconnect(): void;
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
}
