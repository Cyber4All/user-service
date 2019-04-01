import { Db } from 'mongodb';
import { UserMetaDatastore } from '../../../interfaces';
import { MongoConnectionManager } from '../../../../config/mongodb';

const USER_COLLECTION = 'users';

export class MongoUserMetaDatastore implements UserMetaDatastore {
  private db: Db;
  private static instance: MongoUserMetaDatastore;

  private constructor() {
    this.db = MongoConnectionManager.getDbClient();
  }
  /**
   * Returns an instance of MongoUserMetaDatastore
   *
   * @static
   * @returns {MongoUserMetaDatastore}
   * @memberof MongoUserMetaDatastore
   */
  static getInstance(): MongoUserMetaDatastore {
    if (!this.instance) {
      this.instance = new MongoUserMetaDatastore();
    }
    return this.instance;
  }

  /**
   * Fetches roles for specified user
   *
   * @param {string} id
   * @returns {Promise<string[]>}
   * @memberof MongoUserMetaDatastore
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
