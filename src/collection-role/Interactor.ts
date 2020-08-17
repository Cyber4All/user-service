import { UserToken, User } from '../shared/typings';
import { DataStore } from '../interfaces/interfaces';
import {
  hasRoleModificationAccess,
  isCollectionMember,
  isAdmin,
  verifyReadReviewerAccess,
  authorizeRequest
} from './AuthManager';
import {
  ResourceError,
  ResourceErrorReason,
  handleError
} from '../Error';
import { UserDocument } from '../shared/typings/user-document';
import { mapUserDataToUser } from '../shared/functions';

abstract class RoleActions {

  dataStore: DataStore;
  user: UserToken;
  collection: string;
  userId: string;
  role: string;

  constructor(
    dataStore: DataStore,
    user: UserToken,
    collection: string,
    userId: string,
    role: string,
  ) {
    this.dataStore = dataStore;
    this.user = user;
    this.collection = collection;
    this.userId = userId;
    this.role = role;
  }

  /**
   * Template function for modifying a user's collection role
   * @returns { Promise<void> }
   */
  async modifyCollectionRole(): Promise<void> {
    validateRequestParams({
      params: [this.userId, this.role, this.collection],
      mustProvide: ['id', 'role', 'collection']
    });
    authorizeRequest([hasRoleModificationAccess(this.role, this.user, this.collection)]);
      const userDocument = await this.dataStore.findUserById(this.userId);
    if (!userDocument) {
      throw new ResourceError('User Not Found', ResourceErrorReason.NOT_FOUND);
    }
        const formattedAccessGroup = `${this.role}@${this.collection}`;
    await this.performRoleAction(formattedAccessGroup, userDocument);
      }
  abstract performRoleAction(
    formattedAccessGroup: string,
    userDocument: UserDocument,
  ): Promise<void>;
}

export class Assign extends RoleActions {

  static async start(
    dataStore: DataStore,
    user: UserToken,
    collection: string,
    userId: string,
    role: string,
  ): Promise<void> {
    const assign = new Assign(
      dataStore,
      user,
      collection,
      userId,
      role,
    );
    await assign.modifyCollectionRole();
  }

  /**
   * Concrete implementation of performRoleAction function from RoleActions class
   * Assigns a user as a member to a collection
   * Authorization:
   * *** Cannot assign if user already has a role in the given collection  ***
   * *** Must have curator relationship with specified collection to assign reviewer  ***
   * *** Admins can assign reviewers and curators to any collection ***
   * @export
   * @param params
   * @property { string } formattedAccessGroup accessGroup string formatted as `role@collection`
   * @property { UserDocument } userDocument user object fetched from database
   * @returns { Promise<void> }
   */
  async performRoleAction(
    formattedAccessGroup: string,
    userDocument: UserDocument,
  ): Promise<void> {
    if (!isCollectionMember(this.collection, userDocument)) {
      await this.dataStore.assignAccessGroup(this.userId, formattedAccessGroup);
    } else {
      throw new ResourceError(
        `${userDocument.name} is already a member of the ${this.collection} collection.`,
        ResourceErrorReason.BAD_REQUEST,
      );
    }
  }
}

export class Edit extends RoleActions {

  static async start(
    dataStore: DataStore,
    user: UserToken,
    collection: string,
    userId: string,
    role: string,
  ): Promise<void> {
    const edit = new Edit(
      dataStore,
      user,
      collection,
      userId,
      role,
    );
    await edit.modifyCollectionRole();
  }

  /**
   * Concrete implementation of performRoleAction function from RoleActions class
   * Edits an already existing collection membership
   * Authorization:
   * *** Cannot edit role in collection if user is not already member of the collection ***
   * *** Must have curator relationship with specified collection to grant reviewer access  ***
   * *** Admins can grant reviewer and curator access to any collection ***
   * @export
   * @param params
   * @property { string } formattedAccessGroup accessGroup string formatted as `role@collection`
   * @property { UserDocument } userDocument user object fetched from database
   * @returns { Promise<void> }
   */
  async performRoleAction(
    formattedAccessGroup: string,
    userDocument: UserDocument,
  ): Promise<void> {
    if (isCollectionMember(this.collection, userDocument)) {
      await this.dataStore.editAccessGroup(this.userId, formattedAccessGroup, this.collection);
    } else {
      throw new ResourceError(
        `${userDocument.name} is not a member of the ${this.collection} collection.`,
        ResourceErrorReason.BAD_REQUEST
      );
    }
  }
}

  /**
 * Removes an existing collection membership
   * Authorization:
   * *** Cannot remove role if role does not exist ***
   * *** Must have curator relationship with specified collection to remove reviewer access  ***
   * *** Admins can remove reviewer and curator access to any collection ***
   * @export
 * @param {DataStore} dataStore [Driver for the datastore]
 * @param {UserToken} requester [Token containing info about the requester and their privileges]
 * @param {string} userId [Id of the user to remove membership from]
 * @param {string} collection [Collection to remove membership from]
   * @returns { Promise<void> }
   */
export async function removeRole({
  dataStore,
  requester,
  userId,
  collection
}: {
  dataStore: DataStore;
  requester: UserToken;
  userId: string;
  collection: string;
}): Promise<void> {
  try {
    validateRequestParams({
      params: [userId, collection],
      mustProvide: ['id', 'collection']
    });
    const privilege = await dataStore.fetchUserCollectionRole({
      userId,
      collection
    });
    if (!privilege) {
      throw new ResourceError(
        `No user ${userId} found with role within ${collection}`,
        ResourceErrorReason.NOT_FOUND
      );
    }
    const [role] = privilege.split('@');
    authorizeRequest([hasRoleModificationAccess(role, requester, collection)]);
    await dataStore.removeAccessGroup(userId, privilege);
  } catch (e) {
    handleError(e);
  }
}

/**
 * Finds all reviewers for a specified collection
 * Authorization:
 * *** Must be curator of collection or admin  ***
 * @export
 * @param params
 * @property { DataStore } dataStore [instance of DataStore]
 * @property { UserToken } user [the user who made the request]
 * @property { string } collection [the name of the collection]
 * @returns { Promise<any[]> }
 */
export async function fetchReviewers(
  dataStore: DataStore,
  user: UserToken,
  collection: string,
): Promise<any[]> {
  if (verifyReadReviewerAccess(user, collection)) {
    const users = await dataStore.fetchReviewers(collection);
    const reviewers: User[] = users.map(mapUserDataToUser);
    return reviewers;
  }
  throw new ResourceError('Invalid Access', ResourceErrorReason.INVALID_ACCESS);
}

/**
 * Finds all curators for a specified collection
 * Authorization:
 * *** Must be admin ***
 * @export
 * @param params
 * @property { DataStore } dataStore [instance of DataStore]
 * @property { UserToken } user [the user who made the request]
 * @property { string } collection [the name of the collection]
 * @returns { Promise<any[]> }
 */
export async function fetchCurators(
  dataStore: DataStore,
  user: UserToken,
  collection: string,
): Promise<any[]> {
    if(isAdmin(user)) {
      const users = await dataStore.fetchCurators(collection);
      const curators = users.map(mapUserDataToUser);
      return curators;
    }

  throw new ResourceError('Invalid Access', ResourceErrorReason.INVALID_ACCESS);
}

/**
 * Finds all members for a specified collection
 * Authorization:
 * *** Must be admin ***
 * @export
 * @param params
 * @property { DataStore } dataStore [instance of DataStore]
 * @property { UserToken } user [the user who made the request]
 * @property { string } collection [the name of the collection]
 * @returns { Promise<any[]> }
 */
export async function fetchMembers(
  dataStore: DataStore,
  user: UserToken,
  collection: string,
): Promise<any[]> {
  if (isAdmin(user)) {
    const users = await dataStore.fetchCollectionMembers(collection);
    const members = users.map(mapUserDataToUser);
    return members;
  }
  throw new ResourceError('Invalid Access', ResourceErrorReason.INVALID_ACCESS);
}

/**
 * Validates all required values are provided for request
 *
 * @param {any[]} params
 * @param {string[]} [mustProvide]
 * @returns {(void | never)}
 */
function validateRequestParams({
  params,
  mustProvide
}: {
  params: any[];
  mustProvide?: string[];
}): void | never {
  const values = [...params].map(val => {
    if (typeof val === 'string') {
      val = val.trim();
    }
    return val;
  });
  if (
    values.includes(null) ||
    values.includes('null') ||
    values.includes(undefined) ||
    values.includes('undefined') ||
    values.includes('')
  ) {
    const multipleParams = mustProvide.length > 1;
    let message = 'Invalid parameters provided';
    if (Array.isArray(mustProvide)) {
      message = `Must provide ${multipleParams ? '' : 'a'} valid value${
        multipleParams ? 's' : ''
      } for ${mustProvide}`;
    }
    throw new ResourceError(message, ResourceErrorReason.BAD_REQUEST);
  }
}
