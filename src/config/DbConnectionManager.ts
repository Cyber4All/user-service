/**
 * Abstract representation of a DbConnectionManager
 * This is class is meant to be extended.
 * All subclasses of this class should serve to be the single source for managing connections to the database and storing references to the database clients.
 */
export abstract class DbConnectionManager {
  protected constructor() {}
  /**
   * Establishes connections to the Database
   *
   * @static
   * @abstract
   * @param {any} config [Configuration options for establishing connections with the Database]
   * @returns {Promise<void>}
   * @memberof DbConnectionManager
   */
  public static establishConnections(config?: any): Promise<void> {
    throw new Error('Method not implemented!');
  }

  /**
   * Returns instance of connected database client that was requested
   *
   * @static
   * @abstract
   * @param {string} database [The database to get a client instance of]
   * @returns {Promise<void>}
   * @memberof DbConnectionManager
   */
  public static getDbClient(database?: string): any {
    throw new Error('Method not implemented!');
  }
}
