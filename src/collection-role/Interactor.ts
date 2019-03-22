import { UserToken } from '../types/user-token';
import { DataStore } from '../interfaces/interfaces';
import {
  verifyAssignAccess,
  verifyCollectionName,
  isCollectionMember,
  hasAccessGroup,
  isAdmin,
  verifyReadReviewerAccess,
} from './AuthManager';
import { ResourceError, ResourceErrorReason, ServiceError, ServiceErrorReason } from '../Error';
import { UserDocument } from '../types/user-document';

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
    if (verifyAssignAccess(this.role, this.user, this.collection)) {
      const userDocument = await this.dataStore.findUserById(this.userId);
      if (userDocument) {
        const formattedAccessGroup = `${this.role}@${this.collection}`;
        await this.performRoleAction(
          formattedAccessGroup,
          userDocument,
        );
      } else {
        throw new ResourceError(
          'User Not Found',
          ResourceErrorReason.NOT_FOUND
        );
      }
    } else {
      throw new ResourceError(
        'Invalid Access',
        ResourceErrorReason.INVALID_ACCESS
      );
    }
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
      let currentAccessGroup;
      if (formattedAccessGroup.includes('curator')) {
        currentAccessGroup = formattedAccessGroup.replace('curator', 'reviewer');
      } else {
        currentAccessGroup = formattedAccessGroup.replace('reviewer', 'curator');
      }
      await this.dataStore.editAccessGroup(this.userId, formattedAccessGroup, currentAccessGroup);
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
    return await dataStore.fetchReviewers(collection);
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
    return await dataStore.fetchCurators(collection);
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
    return await dataStore.fetchCollectionMembers(collection);
  }
  throw new ResourceError('Invalid Access', ResourceErrorReason.INVALID_ACCESS);
}
