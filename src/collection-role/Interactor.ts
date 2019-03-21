import { UserToken } from '../types/user-token';
import { DataStore } from '../interfaces/interfaces';
import { verifyAssignAccess, verifyCollectionName, isCollectionMember, hasAccessGroup } from './AuthManager';
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

// Cannot assign if user already has a role in the given collection
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

  async performRoleAction(
    formattedAccessGroup: string,
    userDocument: UserDocument,
  ): Promise<void> {
    if (!isCollectionMember(formattedAccessGroup, userDocument)) {
      await this.dataStore.assignAccessGroup(this.userId, formattedAccessGroup);
    } else {
      throw new ResourceError(
        'Access Group Already Exists on this User',
        ResourceErrorReason.BAD_REQUEST,
      );
    }
  }
}

// Cannot edit role in collection if user is not already member of the collection
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

  async performRoleAction(
    formattedAccessGroup: string,
    userDocument: UserDocument,
  ): Promise<void> {
    if (isCollectionMember(formattedAccessGroup, userDocument)) {
      await this.dataStore.removeAccessGroup(this.userId, formattedAccessGroup);
    } else {
      throw new ResourceError(
        'Access Group Does Not Exist on User',
        ResourceErrorReason.BAD_REQUEST
      );
    }
  }
}

// Cannot remove role is role does not exist
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

  async performRoleAction(
    formattedAccessGroup: string,
    userDocument: UserDocument,
  ): Promise<void> {
    if (hasAccessGroup(formattedAccessGroup, userDocument)) {
      await this.dataStore.removeAccessGroup(this.userId, formattedAccessGroup);
    } else {
      throw new ResourceError(
        'Access Group Does Not Exist on User',
        ResourceErrorReason.BAD_REQUEST
      );
    }
  }
}

/**
 * Finds all reviewers for a specified collection
 * @Authorization
 * *** Must be curator  ***
 * @export
 * @param params
 * @property { DataStore } dataStore instance of DataStore
 * @property { UserToken } user the user who made the request
 * @property { string } collection the name of the collection
 * @returns { Promise<any[]> }
 */
export async function fetchReviewers(
  dataStore: DataStore,
  user: UserToken,
  collection: string,
): Promise<any[]> {
  if (verifyCollectionName(user, collection)) {
    const reviewers = await dataStore.fetchReviewers(collection);
    return reviewers;
  }
  throw new ResourceError('Invalid Access', ResourceErrorReason.INVALID_ACCESS);
}
