/**
 * Abstract representation of a DbConnectionManager
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
