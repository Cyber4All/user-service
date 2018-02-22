import { MongoClient, Db, Cursor, ObjectID } from 'mongodb';

import {
  autosFor,
  fixedsFor,
  foreignsFor,
  collections,
  collectionFor,
  schemaFor,
  foreignData,
  Record,
  UserSchema,
  UserRecord,
  UserUpdate,
  UserInsert,
  UserEdit,
  RecordID,
  Insert
} from '@cyber4all/clark-schema';

import { DataStore } from "../interfaces/interfaces";
import { User } from '@cyber4all/clark-entity';
export const AUTHENTICATE = '/authenticate';
export const ADD_USER = '/register';
export const CHECK_EMAIL_REGISTERED = '/emailRegistered';
export const FIND_USER = '/findUser';
export const LOAD_USER = '/loadUser';
export const EDIT_USER = '/editUser';
import * as dotenv from 'dotenv';
dotenv.config();

export default class MongoDriver implements DataStore {

  private db: Db;

  constructor() {
    let dburi = process.env.NODE_ENV === 'production' ?
      process.env.CLARK_DB_URI.replace(/<DB_PASSWORD>/g, process.env.CLARK_DB_PWD).replace(/<DB_PORT>/g, process.env.CLARK_DB_PORT).replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME)
      : process.env.CLARK_DB_URI_DEV.replace(/<DB_PASSWORD>/g, process.env.CLARK_DB_PWD).replace(/<DB_PORT>/g, process.env.CLARK_DB_PORT).replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME);
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
  async connect(dbURI: string): Promise<void> {
    try {
      this.db = await MongoClient.connect(dbURI);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject('Problem connecting to database at ' + dbURI + ':\n\t' + e);
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
     * Insert a user into the database.
     * @async
     *
     * @param {UserInsert} record
     *
     * @returns {UserID} the database id of the new record
     */
  async insertUser(user: User): Promise<User> {
    try {
      let emailRegistered = await this.emailRegistered(user.email);
      if (emailRegistered) return Promise.reject({ error: 'Email is already in use.' });
      user['_id'] = (new ObjectID()).toHexString();
      await this.insert(UserSchema, user);
      return user;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
       * Check if an email is registered to a user in the database.
       *
       * @param {string} email the user's email
       *
       * @returns {boolean} true iff userid/pwd pair is valid
       */
  async emailRegistered(email: string): Promise<boolean> {
    try {
      let doc = await this.db.collection(collectionFor(UserSchema))
        .findOne<UserRecord>({ email: email });
      if (doc) return Promise.resolve(true);
      return Promise.resolve(false);
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
      let userRecord = await this.db.collection(collectionFor(UserSchema))
        .findOne<UserRecord>({ username: username });
      if (!userRecord) return Promise.reject('No user with username ' + username + ' exists.');
      return Promise.resolve(`${userRecord._id}`);
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
      let userRecord = await this.fetch<UserRecord>(UserSchema, id);
      let user = new User(userRecord.username, userRecord.name_, userRecord.email, userRecord['organization'], userRecord.pwdhash);
      return Promise.resolve(user);
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async editUser(id: string, user: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  /**
     * Remove a user (and its objects) from the database.
     * @async
     *
     * @param {UserID} id which document to delete
     */
  async deleteUser(id: string): Promise<void> {
    return this.remove(UserSchema, id);
  }



  ////////////////////////////////////////////////
  // GENERIC HELPER METHODS - not in public API //
  ////////////////////////////////////////////////

  /**
     * Insert a generic item to the database.
     * @async
     *
     * @param {Function} schema provides collection/validation information
     * @param {Insert} record document to insert
     *
     * @returns {RecordID} the database id of the new record
     */
  async  insert(schema: Function, record: Insert): Promise<RecordID> {
    try {
      let collection = collectionFor(schema);
      let foreigns = foreignsFor(schema);
      if (foreigns) (<any>foreigns).difference(autosFor(schema));

      // check validity of all foreign keys
      await this.validateForeignKeys(schema, record, foreigns);

      // perform the actual insert
      let insert_ = await this.db.collection(collection).insertOne(record);
      let id = insert_.insertedId;

      // register the new record as needed
      if (foreigns) for (let foreign of foreigns) {
        let data = foreignData(schema, foreign);
        if (data.registry) {
          await this.addToRegistry(data.target, record[foreign], data.registry, `${id}`);
        }
      }
      return Promise.resolve(id);
    } catch (e) {
      return Promise.reject('Problem inserting a ' + schema.name + ':\n\t' + e);
    }
  }

  /**
     * Fetch a database record by its id.
     * @param {Function} schema provides collection information
     * @param {RecordID} id the document to fetch
     */
  async  fetch<T>(schema: Function, id: string): Promise<T> {
    let record = await this.db.collection(collectionFor(schema)).findOne<T>({ _id: id });
    if (!record) return Promise.reject('Problem fetching a ' + schema.name + ':\n\tInvalid database id ' + JSON.stringify(id));
    return Promise.resolve(record);
  }

  /**
     * Cascade delete a record and its children.
     * @async
     *
     * @param {Function} schema provides collection/hierarcy information
     * @param {RecordID} id the document to delete
     */
  async  remove(schema: Function, id: string): Promise<void> {
    try {
      let collection = collectionFor(schema);

      // fetch data to be deleted ... for the last time :(
      let record = await this.db.collection(collection)
        .findOne<Record>({ _id: id });

      // remove all children recursively, and unregister from parents
      let foreigns = foreignsFor(schema);
      if (foreigns) for (let foreign of foreigns) {
        let data = foreignData(schema, foreign);

        if (data.child) {
          // get children to remove, as an array
          let keys = record[foreign];
          if (!(keys instanceof Array)) keys = [keys];
          // remove each child
          for (let key of keys) {
            await this.remove(schemaFor(data.target), key);
          }
        }

        if (data.registry) {
          // get registries to edit, as an array
          let keys = record[foreign];
          if (!(keys instanceof Array)) keys = [keys];
          // unregister from each key
          for (let key of keys) {
            await this.removeFromRegistry(data.target, key, data.registry, id);
          }
        }
      }

      // perform actual deletion
      await this.db.collection(collection).deleteOne({ _id: id });

      return Promise.resolve();
    } catch (e) {
      return Promise.reject('Problem deleting a ' + schema.name + ':\n\t' + e);
    }
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
  async validateForeignKeys(schema: Function, record: Record, foreigns: Set<string>): Promise<void> {
    try {
      if (foreigns) for (let foreign of foreigns) {
        let data = foreignData(schema, foreign);
        // get id's to check, as an array
        let keys = record[foreign];
        if (!(keys instanceof Array)) keys = [keys];
        // fetch foreign document and reject if it doesn't exist
        for (let key of keys) {
          let count = await this.db.collection(data.target)
            .count({ _id: key });
          if (count === 0) {
            return Promise.reject('Foreign key error for ' + record + ': '
              + key + ' not in ' + data.target + ' collection');
          }
        }
      }
      return Promise.resolve();
    } catch (e) {
      return Promise.reject('Problem validating key constraint for a '
        + schema.name + ':\n\t' + e);
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
  async  addToRegistry(collection: string, ownerID: string, registry: string, itemID: string): Promise<void> {
    try {
      // check validity of values before making any changes
      let record = await this.db.collection(collection).findOne({ _id: ownerID });
      if (!record) return Promise.reject('Registration failed: no owner ' + ownerID + 'found in ' + collection);
      // NOTE: below line is no good because schemaFor(outcomes) is arbitrary
      // let mapping = await this.db.collection(foreignData(schemaFor(collection), registry).target).findOne({ _id: item });
      // TODO: switch register and unregister and probably all thse to use schema instead of collection, so the next line works
      // let mapping = await this.db.collection(foreignData(schema, registry).target).findOne({ _id: item });
      // if (!mapping) return Promise.reject('Registration failed: no mapping ' + mapping + 'found in ' + collection);

      let pushdoc = {};
      pushdoc[registry] = itemID;

      await this.db.collection(collection).updateOne(
        { _id: ownerID },
        { $push: pushdoc },
      );
      return Promise.resolve();
    } catch (e) {
      return Promise.reject('Problem registering to a ' + collections
        + ' ' + registry + ' field:\n\t' + e);
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
  async  removeFromRegistry(collection: string, ownerID: string, registry: string, itemID: string): Promise<void> {
    try {
      // check validity of values before making any changes
      let record = await this.db.collection(collection).findOne({ _id: ownerID });
      if (!record) return Promise.reject('Unregistration failed: no record ' + ownerID + 'found in ' + collection);
      if (!record[registry].includes(itemID)) {
        return Promise.reject('Unregistration failed: record ' + ownerID + '\'s ' + registry + ' field has no element ' + itemID);
      }

      let pulldoc = {};
      pulldoc[registry] = itemID;

      await this.db.collection(collection).updateOne(
        { _id: ownerID },
        { $pull: pulldoc },
      );

      return Promise.resolve();
    } catch (e) {
      return Promise.reject('Problem unregistering from a ' + collections
        + ' ' + registry + ' field:\n\t' + e);
    }
  }
}
