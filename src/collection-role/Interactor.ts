import { UserToken } from '../types/user-token';
import { DataStore } from '../interfaces/interfaces';
import {
  hasRoleModAccess,
  verifyCollectionName,
  isCollectionMember,
  hasAccessGroup,
  isAdmin,
  verifyReadReviewerAccess,
  authorizeRequest
} from './AuthManager';
import { ResourceError, ResourceErrorReason, ServiceError, ServiceErrorReason } from '../Error';
import { UserDocument } from '../types/user-document';
import { User } from '@cyber4all/clark-entity';

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
    authorizeRequest([hasRoleModAccess(this.role, this.user, this.collection)]);
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

export class Remove extends RoleActions {

  static async start(
    dataStore: DataStore,
    user: UserToken,
    collection: string,
    userId: string,
    role: string,
  ): Promise<void> {
    const remove = new Remove(
      dataStore,
      user,
      collection,
      userId,
      role,
    );
    await remove.modifyCollectionRole();
  }

  /**
   * Concrete implementation of performRoleAction function from RoleActions class
   * Removes an already existing collection membership
   * Authorization:
   * *** Cannot remove role if role does not exist ***
   * *** Must have curator relationship with specified collection to remove reviewer access  ***
   * *** Admins can remove reviewer and curator access to any collection ***
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
    if (hasAccessGroup(formattedAccessGroup, userDocument)) {
      await this.dataStore.removeAccessGroup(this.userId, formattedAccessGroup);
    } else {
      throw new ResourceError(
        `${this.user.name} does not have the specified role`,
        ResourceErrorReason.BAD_REQUEST
      );
    }
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
    const reviewers = users.map(user => {
      return new User(user);
    });
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
  if (isAdmin(user)) {
    const users = await dataStore.fetchCurators(collection);
    const curators = users.map(user => {
      return new User(user);
    });
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
    const members = users.map(user => {
      return new User(user);
    });
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
