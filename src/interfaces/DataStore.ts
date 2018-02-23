import { User } from '@cyber4all/clark-entity';

export interface DataStore {
  connect(dbURI: string): Promise<void>;
  disconnect(): void;
  insertUser(user: User): Promise<any>;
  emailRegistered(email: string): Promise<boolean>;
  findUser(username: string): Promise<string>;
  loadUser(id: string): Promise<User>;
  editUser(id: string, user): Promise<void>;
  deleteUser(id: string);
  insertOTACode(
    id: string,
    otaCode: string,
    expiration?: string | number | Date
  ): Promise<void>;
  findOTACode(id: string);
}
