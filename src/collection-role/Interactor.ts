import { UserToken } from '../types/user-token';
import { DataStore } from '../interfaces/interfaces';
import { verifyAssignAccess, verifyCollectionName, hasAccessGroup } from './AuthManager';
import { reportError } from '../drivers/SentryConnector';
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

  async template(): Promise<void> {
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
  async performRoleAction(
    formattedAccessGroup: string,
    userDocument: UserDocument,
  ): Promise<void> {
    if (!hasAccessGroup(formattedAccessGroup, userDocument)) {
      await this.dataStore.assignAccessGroup(this.userId, formattedAccessGroup);
    } else {
      throw new ResourceError(
        'Access Group Already Exists on this User',
        ResourceErrorReason.BAD_REQUEST,
      );
    }
  }
}
export class Edit extends RoleActions {
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

export class Remove extends RoleActions {
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
