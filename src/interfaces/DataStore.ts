import { User } from '@cyber4all/clark-entity';
import { OTACode } from '../drivers/OTACodeManager';

export interface DataStore {
  connect(dbURI: string): Promise<void>;
  disconnect(): void;
  // Properly type to match schema
  insertUser(user: any): Promise<any>;
  emailRegistered(email: string): Promise<boolean>;
  findUser(username: string): Promise<string>;
  loadUser(id: string): Promise<User>;
  editUser(id: string, user: {}): Promise<void>;
  deleteUser(id: string): Promise<void>;
  insertOTACode(otaCode: OTACode): Promise<void>;
  findOTACode(otaCode: string): Promise<string>;
  deleteOTACode(id: string): Promise<void>;
}
