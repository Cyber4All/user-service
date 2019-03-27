import { Db } from 'mongodb';
import { RoleDatastore } from '../../../interfaces';
import { MongoConnectionManager } from '../../../../config/mongodb';

const USER_COLLECTION = 'users';

export class MongoRoleDatastore implements RoleDatastore {
  private db: Db;
  private static instance: MongoRoleDatastore;

  private constructor() {
    this.db = MongoConnectionManager.getDbClient();
  }
  /**
   * Returns an instance of MongoRoleDatastore
   *
   * @static
   * @returns {MongoRoleDatastore}
   * @memberof MongoRoleDatastore
   */
  static getInstance(): MongoRoleDatastore {
    if (!this.instance) {
      this.instance = new MongoRoleDatastore();
    }
    return this.instance;
  }

  /**
   * Fetches roles for specified user
   *
   * @param {string} id
   * @returns {Promise<string[]>}
   * @memberof MongoRoleDatastore
   */
  async fetchUserRoles(id: string): Promise<string[]> {
    const doc = await this.db
      .collection(USER_COLLECTION)
      .findOne<{ accessGroups: string[] }>(
        { _id: id },
        { projection: { _id: 0, accessGroups: 1 } }
      );
    if (doc) {
      return Array.isArray(doc.accessGroups) ? doc.accessGroups : [];
    }
    return null;
  }
}
