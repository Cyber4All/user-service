import { Db, ObjectID } from 'mongodb';
import { DataStore } from '../interfaces/interfaces';
import { UserQuery } from '../interfaces/Query';
import { AuthUser } from '../types/auth-user';
import { UserDocument } from '../types/user-document';
import { UserStats } from '../UserStats/UserStatsInteractor';
import { UserStatStore } from '../UserStats/UserStatStore';
import { OTACode } from './OTACodeManager';
import { MongoConnectionManager } from '../config/mongodb';

export const COLLECTIONS = {
  USERS: 'users',
  OTA_CODES: 'ota-codes',
  LEARNING_OBJECTS: 'objects',
  ORGANIZATIONS: 'organizations'
};

export default class MongoDriver implements DataStore {
  private db: Db;
  private static instance: MongoDriver;

  private statStore: UserStatStore;

  private constructor() {
    this.db = MongoConnectionManager.getDbClient();
    this.initializeModules();
  }
  /**
   * Returns an instance of MongoDriver
   *
   * @static
   * @returns {DataStore}
   * @memberof MongoDriver
   */
  static getInstance(): MongoDriver {
    if (!this.instance) {
      this.instance = new MongoDriver();
    }
    return this.instance;
  }

  /**
   * Initializes module stores
   *
   * @memberof MongoDriver
   */
  initializeModules() {
    this.statStore = new UserStatStore(this.db);
  }

  /**
   * Fetches Stats for User Accounts
   *
   * @param {{ query: any }} params
   * @returns {Promise<UserStats>}
   * @memberof MongoDriver
   */
  fetchStats(params: { query: any }): Promise<UserStats> {
    return this.statStore.fetchStats({ query: params.query });
  }

  /**
   * Check if an username or email is registered to a user in the database.
   *
   * @param {string} username the user's email
   *
   * @returns {boolean} true iff userid/pwd pair is valid
   */
  async identifierInUse(username: string): Promise<boolean> {
    try {
      const query: any = {};
      if (isEmail(username)) {
        query.email = username;
      } else {
        query.username = username;
      }
      const exists = await this.db
        .collection(COLLECTIONS.USERS)
        .findOne<UserDocument>(query, { fields: { _id: 1 } });
      if (exists) {
        return true;
      }
      return false;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
   * Insert a user into the database.
   * @async
   *
   * @param {UserInsert} record
   *
   * @returns {UserID} the database id of the new record
   */
  async insertUser(user: AuthUser): Promise<string> {
    try {
      const userDoc = this.documentUser(user, true);
      await this.db.collection(COLLECTIONS.USERS).insertOne(userDoc);
      return userDoc._id;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
   * Look up a user by its login id.
   * @async
   *
   * @param {string} id the user's login id
   *
   * @returns {UserID}
   */
  async findUser(username: string): Promise<string> {
    try {
      const query: any = {};
      if (isEmail(username)) {
        query.email = username;
      } else {
        query.username = username;
      }
      const userRecord: { _id: string } = await this.db
        .collection(COLLECTIONS.USERS)
        .findOne(query, { projection: { _id: 1 } });
      if (!userRecord) {
        return Promise.reject(
          `No user with username or email ${username}, exists.`
        );
      }
      return `${userRecord._id}`;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async searchUsers(
    query: UserQuery
  ): Promise<{ users: AuthUser[]; total: number }> {
    try {
      query.page = +query.page;
      if (query.page !== undefined && query.page <= 0) {
        query.page = 1;
      }
      const limit = +query.limit;
      const skip =
        query.page && query.limit ? (query.page - 1) * query.limit : undefined;
      const orderBy = query.orderBy;
      const sortType = +query.sortType;

      const mongoQuery = this.buildUserQuery(query);

      let objectCursor = await this.db
        .collection(COLLECTIONS.USERS)
        .find<UserDocument>(mongoQuery);

      const total = await objectCursor.count();

      objectCursor =
        skip !== undefined
          ? objectCursor.skip(skip).limit(limit)
          : limit
            ? objectCursor.limit(limit)
            : objectCursor;

      objectCursor = orderBy
        ? objectCursor.sort(orderBy, sortType ? sortType : 1)
        : objectCursor
            .sort({ score: { $meta: 'textScore' } })
            .project({ score: { $meta: 'textScore' } });

      const userDocs = await objectCursor.toArray();

      const users: AuthUser[] = userDocs.map((user: UserDocument) =>
        this.generateUser(user)
      );
      return { users, total };
    } catch (e) {
      return Promise.reject(e);
    }
  }

  private buildUserQuery(query: UserQuery): any {
    delete query.page;
    delete query.limit;
    delete query.orderBy;
    delete query.sortType;

    const text = query.text;
    delete query.text;

    const mongoQuery: any = {};

    for (const key of Object.keys(query)) {
      mongoQuery[key] = query[key];
    }

    if (text) {
      mongoQuery.$or = [
        {
          $text: {
            $search: text
          }
        },
        { username: new RegExp(text, 'g') },
        { name: new RegExp(text, 'g') },
        { email: new RegExp(text, 'g') },
        { organization: new RegExp(text, 'g') }
      ];
    }
    return mongoQuery;
  }
  /**
   * Fetch the user document associated with the given id.
   * @async
   *
   * @param id database id
   *
   * @returns {UserRecord}
   */
  async loadUser(id: string): Promise<AuthUser> {
    try {
      const userRecord = await this.db
        .collection(COLLECTIONS.USERS)
        .findOne<UserDocument>({ _id: id });
      const user = this.generateUser(userRecord);
      return user;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async editUser(
    id: string,
    object: { [index: string]: any }
  ): Promise<AuthUser> {
    try {
      if (object.name) {
        object.name = object.name.trim();
      }
      await this.db.collection(COLLECTIONS.USERS).update(
        { _id: id },
        {
          $set: object
        }
      );

      return await this.loadUser(id);
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * Remove a user from the database.
   * @async
   *
   * @param {UserID} id which document to delete
   */
  async deleteUser(id: string): Promise<void> {
    await this.db
      .collection(COLLECTIONS.LEARNING_OBJECTS)
      .deleteOne({ authorID: id });
    await this.db.collection(COLLECTIONS.USERS).deleteOne({ _id: id });
  }

  /**
   * Retrieve reviewers of a collection
   * @param params
   * @property { string } collection name of the collection
   * @returns { Promise<any[]> }
   */
  async fetchReviewers(collection: string): Promise<any[]> {
    const users = await this.db
      .collection(COLLECTIONS.USERS)
      .find<UserDocument>({ accessGroups: `reviewer@${collection}` })
      .toArray();

    const reviewers: AuthUser[] = users.map((user: UserDocument) =>
      this.generateUser(user)
    );
    return reviewers;
  }

  /**
   * Retrieve curators of a collection
   * @param params
   * @property { string } collection name of the collection
   * @returns { Promise<any[]> }
   */
  async fetchCurators(collection: string): Promise<any[]> {
    const users = await this.db
      .collection(COLLECTIONS.USERS)
      .find<UserDocument>({ accessGroups: `curator@${collection}` })
      .toArray();

    const curators: AuthUser[] = users.map((user: UserDocument) =>
      this.generateUser(user)
    );
    return curators;
  }

  /**
   * Retrieve members of a collection (curators and reviewers)
   * @param params
   * @property { string } collection name of the collection
   * @returns { Promise<any[]> }
   */
  async fetchCollectionMembers(collection: string): Promise<any[]> {
    const users = await this.db
      .collection(COLLECTIONS.USERS)
      .find<UserDocument>({
        $or: [
          { accessGroups: `reviewer@${collection}` },
          { accessGroups: `curator@${collection}` }
        ]
      })
      .toArray();

    const members: AuthUser[] = users.map((user: UserDocument) =>
      this.generateUser(user)
    );
    return members;
  }

  /**
   * Retrieve user document for a specifed id
   * @param params
   * @property { string } userId the id of the user to search for
   * @returns { Promise<UserDocument> }
   */
  async findUserById(userId: string): Promise<UserDocument> {
    const user = await this.db
      .collection(COLLECTIONS.USERS)
      .findOne<UserDocument>({ _id: userId });
    return user;
  }

  /**
   * push new access group to accessGroups array
   * @param params
   * @property { string } userId the id of the user to search for
   * @property { string } formattedAccessGroup access group to push to array
   * @returns { Promise<void> }
   */
  async assignAccessGroup(
    userId: string,
    formattedAccessGroup: string
  ): Promise<void> {
    await this.db
      .collection(COLLECTIONS.USERS)
      .updateOne(
        { _id: userId },
        { $addToSet: { accessGroups: formattedAccessGroup } }
      );
  }

  /**
   * replace access group in accessGroups array
   * @param params
   * @property { string } userId the id of the user to search for
   * @property { string } formattedAccessGroup access group to push to array
   * @property { string } collection name of collection
   * @returns { Promise<void> }
   */
  async editAccessGroup(
    userId: string,
    formattedAccessGroup: string,
    collection: string
  ): Promise<void> {
    await this.db
      .collection(COLLECTIONS.USERS)
      .updateOne(
        { _id: userId, accessGroups: { $regex: collection } },
        { $set: { 'accessGroups.$': formattedAccessGroup } }
      );
  }

  /**
   * pull access group from accessGroups array
   * @param params
   * @property { string } userId the id of the user to search for
   * @property { string } formattedAccessGroup access group to pull from array
   * @returns { Promise<void> }
   */
  async removeAccessGroup(
    userId: string,
    formattedAccessGroup: string
  ): Promise<void> {
    await this.db
      .collection(COLLECTIONS.USERS)
      .updateOne(
        { _id: userId },
        { $pull: { accessGroups: formattedAccessGroup } }
      );
  }

  async insertOTACode(otaCode: OTACode): Promise<void> {
    try {
      await this.db.collection(COLLECTIONS.OTA_CODES).insertOne(otaCode);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async findOTACode(code: string): Promise<string> {
    try {
      const otaCodeRecord = await this.db
        .collection(COLLECTIONS.OTA_CODES)
        .findOne<OTACode>({ code });
      return otaCodeRecord
        ? otaCodeRecord.id
        : Promise.reject('No record found');
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async deleteOTACode(id: string): Promise<void> {
    try {
      await this.db.collection(COLLECTIONS.OTA_CODES).deleteOne({ id });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async findOrganizations(query: string): Promise<any[]> {
    try {
      // Match the entire phrase instead of individual words
      const search = '"' + query + '"';
      const text: any = { $text: { $search: search } };
      const organizations = await this.db
        .collection(COLLECTIONS.ORGANIZATIONS)
        .aggregate([
          { $match: text },
          {
            $project: {
              institution: 1,
              score: { $meta: 'textScore' }
            }
          },
          { $limit: 5 }
        ])
        .sort({ score: { $meta: 'textScore' } });
      const arr = await organizations.toArray();
      return arr;
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  }

  ////////////////////////////////////////////////
  // GENERIC HELPER METHODS - not in public API //
  ////////////////////////////////////////////////

  private documentUser(user: AuthUser, isNew?: boolean): Partial<UserDocument> {
    const userDocument: Partial<UserDocument> = {
      username: user.username,
      name: user.name,
      email: user.email,
      organization: user.organization.toLowerCase(),
      password: user.password,
      emailVerified: user.emailVerified,
      bio: user.bio
    };
    if (!isNew) {
      delete userDocument._id;
    }
    if (isNew) {
      userDocument._id = new ObjectID().toHexString();
      userDocument.emailVerified = false;
      userDocument.bio = '';
      userDocument.createdAt = Date.now().toString();
    }
    return userDocument;
  }

  private generateUser(userRecord: UserDocument): AuthUser {
    const user = new AuthUser({
      id: userRecord._id,
      username: userRecord.username,
      name: userRecord.name,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      bio: userRecord.bio,
      organization: userRecord.organization,
      createdAt: userRecord.createdAt,
      password: userRecord.password,
      accessGroups: userRecord.accessGroups
    });
    return user;
  }
}

export function isEmail(value: string): boolean {
  // tslint:disable-next-line:max-line-length
  const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (emailPattern.test(value)) {
    return true;
  }
  return false;
}
