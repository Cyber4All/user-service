import { DataStore } from '../interfaces/interfaces';
import { User } from '@cyber4all/clark-entity';
import { OTACode } from './OTACodeManager';
import { UserQuery } from '../interfaces/Query';
import * as loki from 'lokijs';
import { UserDocument } from '@cyber4all/clark-schema';

export default class LokiDriver implements DataStore {
  private db: loki;

  connect(dbURI: string): Promise<void> {
    try {
      // Read JSON
      const onion = require('../../onion.json');
      // Convert JSON into Loki dump
      this.db = new loki('onion.db');
      this.insertCollections(onion);
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  }    
    
  private insertCollections(onion: any) {
    // Only need to create/insert collections used in tests
    const objects = this.db.addCollection('objects');
    objects.insert(onion.objects);
    const users = this.db.addCollection('users');
    users.insert(onion.users);
  }

  disconnect(): void {
    throw new Error('Method not implemented.');
    // Destory Loki Dump
  }

  async identifierInUse(username: string): Promise<boolean> {
    try {
      const coll = this.db.getCollection('objects');
      const exists = coll.find({ username });
      if (exists) {
        return true;
      }
      return false;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  insertUser(user: User): Promise<string> {
    try {
      const coll = this.db.getCollection('users');
      coll.insert(user);
      return user._id;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async findUser(username: string): Promise<string> {
    try {
      const coll = this.db.getCollection('users');
      const user = await coll.find({ username });
      return user[0]._id;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async loadUser(id: string): Promise<User> {
    const coll = this.db.getCollection('users');
    const user = coll.find({ _id: id });
    return user;
  }

  async editUser(id: string, user: {}): Promise<User> {
    const coll = this.db.getCollection('users');
    const resultSet = coll.chain().find({ _id: id });
    resultSet.update(user);
    const user = coll.find({ _id: id });
    return user;
  }

  deleteUser(id: string): Promise<void> {
    const coll = this.db.getCollection('users');
    const resultSet = coll.chain().find({ _id: id });
    resultSet.remove();
    return;
  }
    
  insertOTACode(otaCode: OTACode): Promise<void> {
    const coll = this.db.getCollection('OTACode');
    coll.insert(otaCode);
    return;
  }

  async findOTACode(otaCode: string): Promise<string> {
    const coll = this.db.getCollection('OTACode');
    const code = coll.find({ otaCode });
    return code;
  }

  deleteOTACode(id: string): Promise<void> {
    try {
      const coll = this.db.getCollection('OTACode');
      coll.remove({ _id: id });
      return;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  searchUsers(
    query: UserQuery
  ): Promise<{ users: User[]; total: number; }> {
    try {
      const coll = this.db.getCollection('users');
      const users = coll.find({ username: 'nvisal1' });
      const total = 1;
      return { users, total };
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async findOrganizations(query: string): Promise<any[]> {
    const coll = this.db.getCollection('organizations');
    const orgs = coll.find({ institution: 'Towson University' });
    return orgs;
  }
}
