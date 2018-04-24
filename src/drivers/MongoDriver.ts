import { MongoClient, Db, Cursor, ObjectID } from 'mongodb';

import { UserDocument } from '@cyber4all/clark-schema';

import { DataStore } from '../interfaces/interfaces';
import { User } from '@cyber4all/clark-entity';
import * as dotenv from 'dotenv';
import { OTACode } from './OTACodeManager';
dotenv.config();

export interface Collection {
  name: string;
  foreigns?: Foriegn[];
  uniques?: string[];
  text?: string[];
}
export interface Foriegn {
  name: string;
  data: ForiegnData;
}

export interface ForiegnData {
  target: string;
  child: boolean;
  registry?: string;
}
export class COLLECTIONS {
  public static User: Collection = {
    name: 'users',
    foreigns: [
      {
        name: 'objects',
        data: {
          target: 'LearningObject',
          child: true
        }
      }
    ],
    uniques: ['username']
  };
  public static LearningObject: Collection = {
    name: 'objects',
    foreigns: [
      {
        name: 'authorID',
        data: {
          target: 'User',
          child: false,
          registry: 'objects'
        }
      },
      {
        name: 'outcomes',
        data: {
          target: 'LearningOutcome',
          child: true,
          registry: 'source'
        }
      }
    ]
  };
  public static LearningOutcome: Collection = {
    name: 'learning-outcomes',
    foreigns: [
      {
        name: 'source',
        data: {
          target: 'LearningObject',
          child: false,
          registry: 'outcomes'
        }
      }
    ]
  };
  public static StandardOutcome: Collection = { name: 'outcomes' };
  public static LearningObjectCollection: Collection = { name: 'collections' };
  public static OTACode: Collection = { name: 'ota-codes' };
}

const COLLECTIONS_MAP = new Map<string, Collection>();
COLLECTIONS_MAP.set('User', COLLECTIONS.User);
COLLECTIONS_MAP.set('LearningObject', COLLECTIONS.LearningObject);
COLLECTIONS_MAP.set('LearningOutcome', COLLECTIONS.LearningOutcome);
COLLECTIONS_MAP.set('StandardOutcome', COLLECTIONS.StandardOutcome);
COLLECTIONS_MAP.set(
  'LearningObjectCollection',
  COLLECTIONS.LearningObjectCollection
);
COLLECTIONS_MAP.set('OTACode', COLLECTIONS.OTACode);

export default class MongoDriver implements DataStore {
  private db: Db;

  constructor() {
    const dburi =
      process.env.NODE_ENV === 'production'
        ? process.env.CLARK_DB_URI.replace(
            /<DB_PASSWORD>/g,
            process.env.CLARK_DB_PWD
          )
            .replace(/<DB_PORT>/g, process.env.CLARK_DB_PORT)
            .replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME)
        : process.env.CLARK_DB_URI_DEV.replace(
            /<DB_PASSWORD>/g,
            process.env.CLARK_DB_PWD
          )
            .replace(/<DB_PORT>/g, process.env.CLARK_DB_PORT)
            .replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME);
    this.connect(dburi);
  }

  /**
   * Connect to the database. Must be called before any other functions.
   * @async
   *
   * NOTE: This function will attempt to connect to the database every
   *       time it is called, but since it assigns the result to a local
   *       variable which can only ever be created once, only one
   *       connection will ever be active at a time.
   *
   * TODO: Verify that connections are automatically closed
   *       when they no longer have a reference.
   *
   * @param {string} dbIP the host and port on which mongodb is running
   */
  async connect(dbURI: string, retryAttempt?: number): Promise<void> {
    try {
      this.db = await MongoClient.connect(dbURI);
    } catch (e) {
      if (!retryAttempt) {
        this.connect(dbURI, 1);
      } else {
        return Promise.reject(
          'Problem connecting to database at ' + dbURI + ':\n\t' + e
        );
      }
    }
  }
  /**
   * Close the database. Note that this will affect all services
   * and scripts using the database, so only do this if it's very
   * important or if you are sure that *everything* is finished.
   */
  disconnect(): void {
    this.db.close();
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
        .collection(COLLECTIONS.User.name)
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
  async insertUser(user: User): Promise<string> {
    try {
      const userDoc = this.documentUser(user, true);
      await this.insert(COLLECTIONS.User, userDoc);
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
      const userRecord = await this.db
        .collection(COLLECTIONS.User.name)
        .findOne<UserDocument>(query);
      if (!userRecord) {
        return Promise.reject(
          'No user with username or email ' + username + ' exists.'
        );
      }
      return `${userRecord._id}`;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async searchUsers(query: {}): Promise<User[]> {
    try {
      const userDocs = await this.db
        .collection(COLLECTIONS.User.name)
        .find<UserDocument>(query)
        .toArray();
      const users: User[] = userDocs.map(user => this.generateUser(user));
      return users;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * Fetch the user document associated with the given id.
   * @async
   *
   * @param id database id
   *
   * @returns {UserRecord}
   */
  async loadUser(id: string): Promise<User> {
    try {
      const userRecord = await this.fetch<UserDocument>(COLLECTIONS.User, id);
      const user = this.generateUser(userRecord);
      return user;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async editUser(id: string, object: {}): Promise<User> {
    try {
      if (object['name']) object['name'] = object['name'].trim();
      await this.db.collection(COLLECTIONS.User.name).update(
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
   * Remove a user (and its objects) from the database.
   * @async
   *
   * @param {UserID} id which document to delete
   */
  async deleteUser(id: string): Promise<void> {
    return this.remove(COLLECTIONS.User, id);
  }

  async insertOTACode(otaCode: OTACode): Promise<void> {
    try {
      await this.db.collection(COLLECTIONS.OTACode.name).insertOne(otaCode);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async findOTACode(code: string): Promise<string> {
    try {
      const otaCodeRecord = await this.db
        .collection(COLLECTIONS.OTACode.name)
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
      await this.db.collection(COLLECTIONS.OTACode.name).deleteOne({ id });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  ////////////////////////////////////////////////
  // GENERIC HELPER METHODS - not in public API //
  ////////////////////////////////////////////////

  private documentUser(user: User, isNew?: boolean): UserDocument {
    const userDocument: UserDocument = {
      username: user.username,
      name: user.name.trim(),
      email: user.email,
      organization: user.organization,
      password: user.password,
      objects: [],
      emailVerified: user.emailVerified
    };
    if (!isNew) {
      delete userDocument._id;
    }
    if (isNew) {
      userDocument._id = new ObjectID().toHexString();
      userDocument.emailVerified = false;
      //  TODO: Add property to UserDocument
      userDocument['createdAt'] = Date.now().toString();
    }
    return userDocument;
  }

  private generateUser(userRecord: UserDocument): User {
    const user = new User(
      userRecord.username,
      userRecord.name,
      userRecord.email,
      userRecord.organization,
      userRecord.password
    );
    // Append Email Verified Prop
    user.emailVerified = userRecord.emailVerified
      ? userRecord.emailVerified
      : false;
    // TODO: Add property to UserDocument
    user.createdAt = userRecord['createdAt'];
    return user;
  }

  /**
   * Reject promise if any foreign keys in a record do not exist.
   * @async
   *
   * @param {Function} schema provides information for each foreign key
   * @param {Record} record which record to validate
   * @param {Set<string>} foreigns which fields to check
   *
   * @returns none, but promise will be rejected if there is a problem
   */
  private async validateForeignKeys<T>(
    record: T,
    foreigns: Foriegn[]
  ): Promise<void> {
    try {
      if (foreigns) {
        for (const foreign of foreigns) {
          const data = foreign.data;
          // get id's to check, as an array
          let keys = record[foreign.name];
          if (!(keys instanceof Array)) keys = [keys];
          // fetch foreign document and reject if it doesn't exist
          for (const key of keys) {
            const collection = COLLECTIONS_MAP.get(data.target);
            const count = await this.db
              .collection(collection.name)
              .count({ _id: key });
            if (count === 0) {
              return Promise.reject(
                'Foreign key error for ' +
                  record +
                  ': ' +
                  key +
                  ' not in ' +
                  data.target +
                  ' collection'
              );
            }
          }
        }
      }

      return Promise.resolve();
    } catch (e) {
      return Promise.reject('Problem validating key constraint :\n\t' + e);
    }
  }

  /**
   * Add an item's id to a foreign registry.
   * @async
   *
   * @param {string} collection where to find the foreign registry owner
   * @param {RecordID} owner the foreign registry owner
   * @param {string} registry field name of the registry
   * @param {RecordID} item which item to add
   */
  private async register(
    collection: Collection,
    owner: string,
    registry: string,
    item: string
  ): Promise<void> {
    try {
      // check validity of values before making any changes
      const record = await this.db
        .collection(collection.name)
        .findOne({ _id: owner });
      if (!record) {
        return Promise.reject(
          'Registration failed: no owner ' +
            owner +
            'found in ' +
            collection.name
        );
      }

      const pushdoc = {};
      pushdoc[registry] = item;

      await this.db
        .collection(collection.name)
        .updateOne({ _id: owner }, { $push: pushdoc });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(
        'Problem registering to a ' +
          collection.name +
          ' ' +
          registry +
          ' field:\n\t' +
          e
      );
    }
  }

  /**
   * Remove an item's id from a foreign registry.
   * @async
   *
   * @param {string} collection where to find the foreign registry owner
   * @param {RecordID} owner the foreign registry owner
   * @param {string} registry field name of the registry
   * @param {RecordID} item which item to remove
   */
  private async unregister(
    collection: Collection,
    owner: string,
    registry: string,
    item: string
  ): Promise<void> {
    try {
      // check validity of values before making any changes
      const record = await this.db
        .collection(collection.name)
        .findOne({ _id: owner });
      if (!record) {
        return Promise.reject(
          'Unregistration failed: no record ' + owner + 'found in ' + collection
        );
      }

      if (!record[registry].includes(item)) {
        return Promise.reject(
          'Unregistration failed: record ' +
            owner +
            's ' +
            registry +
            ' field has no element ' +
            item
        );
      }

      const pulldoc = {};
      pulldoc[registry] = item;

      await this.db
        .collection(collection.name)
        .updateOne({ _id: owner }, { $pull: pulldoc });

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(
        'Problem unregistering from a ' +
          collection.name +
          ' ' +
          registry +
          ' field:\n\t' +
          e
      );
    }
  }

  /**
   * Insert a generic item to the database.
   * @async
   *
   * @param {Function} schema provides collection/validation information
   * @param {Insert} record document to insert
   *
   * @returns {RecordID} the database id of the new record
   */
  private async insert<T>(collection: Collection, record: T): Promise<string> {
    try {
      const foreigns = collection.foreigns;
      if (foreigns) {
        // check validity of all foreign keys
        await this.validateForeignKeys(record, foreigns);
      }

      // perform the actual insert
      const insert = await this.db
        .collection(collection.name)
        .insertOne(record);
      const id = insert.insertedId;

      // register the new record as needed
      if (foreigns) {
        for (const foreign of foreigns) {
          const data = foreign.data;
          if (!data.child && data.registry) {
            const collection = COLLECTIONS_MAP.get(data.target);
            await this.register(
              collection,
              record[foreign.name],
              data.registry,
              `${id}`
            );
          }
        }
      }

      return Promise.resolve(`${id}`);
    } catch (e) {
      return Promise.reject(
        'Problem inserting a ' + collection.name + ':\n\t' + e
      );
    }
  }

  /**
   * Edit (update without foreigns) a generic item in the database.
   * @async
   *
   * @param {Function} schema provides collection/validation information
   * @param {RecordID} id which document to edit
   * @param {Edit} record the values to change to
   */
  private async edit<T>(
    collection: Collection,
    id: string,
    record: T
  ): Promise<void> {
    try {
      // no foreign fields, no need to validate

      // perform the actual update
      await this.db
        .collection(collection.name)
        .updateOne({ _id: id }, { $set: record });

      // registered fields must be fixed, nothing to change here

      return Promise.resolve();
    } catch (e) {
      console.log(e);
      return Promise.reject(
        'Problem editing a ' + collection.name + ':\n\t' + e
      );
    }
  }

  /**
   * Cascade delete a record and its children.
   * @async
   *
   * @param {COLLECTIONS} collection provides collection information
   * @param {string} id the document to delete
   */
  private async remove<T>(collection: Collection, id: string): Promise<void> {
    try {
      // fetch data to be deleted ... for the last time :(
      const record = await this.db
        .collection(collection.name)
        .findOne<T>({ _id: id });

      // remove all children recursively, and unregister from parents
      const foreigns = collection.foreigns;
      if (foreigns) {
        for (const foreign of foreigns) {
          const data = foreign.data;

          if (data.child) {
            // get children to remove, as an array
            let keys = record[foreign.name];
            if (!(keys instanceof Array)) keys = [keys];
            // remove each child
            for (const key of keys) {
              const collection = COLLECTIONS_MAP.get(data.target);
              await this.remove(collection, key);
            }
          }

          if (!data.child && data.registry) {
            // get registries to edit, as an array
            let keys = record[foreign.name];
            if (!(keys instanceof Array)) keys = [keys];
            // unregister from each key
            for (const key of keys) {
              const collection = COLLECTIONS_MAP.get(data.target);
              await this.unregister(collection, key, data.registry, id);
            }
          }
        }
      }

      // perform actual deletion
      await this.db.collection(collection.name).deleteOne({ _id: id });

      return Promise.resolve();
    } catch (e) {
      return Promise.reject('Problem deleting a ' + collection + ':\n\t' + e);
    }
  }

  /**
   * Fetch a database record by its id.
   * @param {Function} schema provides collection information
   * @param {string} id the document to fetch
   */
  private async fetch<T>(collection: Collection, id: string): Promise<T> {
    const record = await this.db
      .collection(collection.name)
      .findOne<T>({ _id: id });
    if (!record) {
      return Promise.reject(
        'Problem fetching a ' +
          collection +
          ':\n\tInvalid database id ' +
          JSON.stringify(id)
      );
    }

    return Promise.resolve(record);
  }
}

export function isEmail(value: string): boolean {
  const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (emailPattern.test(value)) {
    return true;
  }
  return false;
}
