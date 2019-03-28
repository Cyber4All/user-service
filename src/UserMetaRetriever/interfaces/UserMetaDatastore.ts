export abstract class UserMetaDatastore {
  /**
   * Fetches roles for specified user
   *
   * @abstract
   * @param {string} id [User id to retrieve roles of]
   * @returns {Promise<string[]>}
   * @memberof UserMetaDatastore
   */
  abstract fetchUserRoles(id: string): Promise<string[]>;
}
