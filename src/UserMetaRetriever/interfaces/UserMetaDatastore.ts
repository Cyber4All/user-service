import { AuthUser } from "../typings";

export abstract class UserMetaDatastore {
  /**
   * Fetches user data by id
   *
   * @abstract
   * @param {string} id [The unique id of the user to fetch]
   * @returns {Promise<AuthUser>}
   * @memberof UserMetaDatastore
   */
  abstract fetchUser(id: string): Promise<AuthUser>;
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
