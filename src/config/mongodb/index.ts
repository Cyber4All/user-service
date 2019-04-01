import 'dotenv/config';
import { Db, MongoClient } from 'mongodb';
import { DbConnectionManager } from '../DbConnectionManager';

/**
 * Retrieve environment specific config once during static eval
 */
const environment = process.env.NODE_ENV;
let DB_URI = '';
switch (environment) {
  case 'development':
    DB_URI = process.env.CLARK_DB_URI_DEV;
    break;
  case 'production':
    DB_URI = process.env.CLARK_DB_URI;
    break;
  case 'test':
    DB_URI = process.env.CLARK_DB_URI_TEST;
    break;
  default:
    DB_URI = process.env.CLARK_DB_URI_DEV;
    break;
}
const DB_PASSWORD = process.env.CLARK_DB_PWD;
const DB_PORT = process.env.CLARK_DB_PORT;
const DB_NAME = process.env.CLARK_DB_NAME;

/**
 * Enumeration of all available DbRefs
 */
export enum DbRef {
  DEFAULT_DB = DB_NAME as any
}

/**
 * Single point for managing all connections to MongoDb
 *
 * @export
 * @class MongoConnectionManager
 */
export class MongoConnectionManager extends DbConnectionManager {
  private static mongoClient: MongoClient;
  private static dbConnections: Map<DbRef, Db> = new Map();

  /**
   * Establishes connection to MongoClient and defined DbRefs
   * Caches database connections for future retrieval
   * @param {string} uri [Optional URI for connecting to a MongoDB not defined in the `getURI` function]
   * @static
   * @returns {Promise<void>}
   * @memberof MongoConnectionManager
   */
  public static async establishConnections(uri?: string): Promise<void> {
    if (!this.mongoClient) {
      try {
        this.mongoClient = await new MongoClient(uri || this.getURI(), {
          reconnectTries: 3
        }).connect();
        this.cacheDbInstances();
      } catch (e) {
        return Promise.reject(
          new Error('Unable to establish connection to MongoDB.')
        );
      }
    }
  }

  /**
   * Stores DB references for defined DbRefs
   *
   * @private
   * @static
   * @memberof MongoConnectionManager
   */
  private static cacheDbInstances() {
    const dbKeys = Object.keys(DbRef);
    dbKeys.map(key => {
      const dbName = DbRef[key];
      const db = this.mongoClient.db(dbName);
      this.dbConnections.set(dbName, db);
    });
  }

  /**
   * Closes connection to MongoDB and clears database connections cache
   *
   * @static
   * @returns {Promise<void>}
   * @memberof MongoConnectionManager
   */
  public static async disconnect(): Promise<void> {
    await this.mongoClient.close();
    this.mongoClient = undefined;
    this.dbConnections = new Map<DbRef, Db>();
  }

  /**
   * Returns instance of connected database client that was requested.
   * If none specified, defaults to DEFAULT_DB.
   * Throws error if connection has not been established or if no DB clients are found
   *
   * @static
   * @param {DbRef} database [The database to get a client instance of]
   * @returns {Db}
   * @memberof MongoConnectionManager
   */
  public static getDbClient(database?: string): Db {
    if (!this.mongoClient || this.dbConnections.size === 0) {
      throw new Error('Connection to MongoDB has not been established.');
    }
    const dbRef: DbRef = (database as any) || DbRef.DEFAULT_DB;
    const db = this.dbConnections.get(dbRef);
    if (!db) {
      throw new Error(`Unable to retrieve DB client for ${database}`);
    }
    return db;
  }

  /**
   * Inserts sensitive data required in URI and returns the full URI
   *
   * @private
   * @static
   * @returns
   * @memberof MongoConnectionManager
   */
  private static getURI() {
    return DB_URI.replace(/<DB_PASSWORD>/g, DB_PASSWORD)
      .replace(/<DB_PORT>/g, DB_PORT)
      .replace(/<DB_NAME>/g, DB_NAME);
  }
}
