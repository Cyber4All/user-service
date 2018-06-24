import { User } from '@cyber4all/clark-entity';
import { OTACode } from '../drivers/OTACodeManager';
import { UserQuery } from './Query';

export interface DataStore {
  connect(dbURI: string): Promise<void>;
  disconnect(): void;
  identifierInUse(username: string): Promise<boolean>;
  insertUser(user: User): Promise<string>;
  findUser(username: string): Promise<string>;
  loadUser(id: string): Promise<User>;
  editUser(id: string, user: {}): Promise<User>;
  deleteUser(id: string): Promise<void>;
  insertOTACode(otaCode: OTACode): Promise<void>;
  findOTACode(otaCode: string): Promise<string>;
  deleteOTACode(id: string): Promise<void>;
  searchUsers(query: UserQuery): Promise<{ users: User[]; total: number }>;
  findOrganizations(query: string): Promise<any[]>;
  checkOrganization(query: string): Promise<boolean>;
}
