import { Db } from 'mongodb';
import { UserMetaDatastore } from '../../../interfaces';
import { MongoConnectionManager } from '../../../../config/mongodb';
import { AuthUser } from '../../../typings';
import { mapUserDataToAuthUser } from '../../../../shared/functions';

const USER_COLLECTION = 'users';

export class MongoUserMetaDatastore implements UserMetaDatastore {
  
  private db: Db;
  private static instance: MongoUserMetaDatastore;

  private constructor() {
    this.db = MongoConnectionManager.getDbClient();
  }

  /**
   * @inheritdoc
   *
   * @returns {Promise<AuthUser>}
   * @memberof MongoUserMetaDatastore
   */
  async fetchUser(id: string): Promise<AuthUser> {
    const user = await this.db.collection(USER_COLLECTION).findOne({_id: id});
    if(user){
      return mapUserDataToAuthUser({...user as AuthUser, id: user._id});
    }
    return null;
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
