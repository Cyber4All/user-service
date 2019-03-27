export abstract class RoleDatastore {
  /**
   * Fetches roles for specified user
   *
   * @abstract
   * @param {string} id [User id to retrieve roles of]
   * @returns {Promise<string[]>}
   * @memberof RoleDatastore
   */
  abstract fetchUserRoles(id: string): Promise<string[]>;
}
