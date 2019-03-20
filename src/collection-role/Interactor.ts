import { UserToken } from '../types/user-token';
import { DataStore } from '../interfaces/interfaces';
import { verifyAssignAccess, verifyCollectionName, hasAccessGroup } from './AuthManager';
import { reportError } from '../drivers/SentryConnector';
import { ResourceError, ResourceErrorReason, ServiceError, ServiceErrorReason } from '../Error';

const ROLE_ACTIONS = {
  ASSIGN: 'assign',
  REMOVE: 'remove',
};

/**
 * modifies the role of a specific user in a collection
 * @Authorization
 * *** Must be curator to modify reviewer ***
 * *** Admins can modify reviewer and curator roles ***
 * @export
 * @param params
 * @property { DataStore } dataStore instance of DataStore
 * @property { UserToken } user the user who made the request
 * @property { string } collection the name of the collection
 * @property { string } userId the id of the user being modified
 * @property { string } role the name of the role to modify (reviewer/curator)
 * @property { string } action tells the function whether to assign or remove a role (assign/remove)
 * @returns { Promise<void> }
 */
export async function modifyRoleAccess(
    dataStore: DataStore,
    user: UserToken,
    collection: string,
    userId: string,
    role: string,
    action: string,
  ): Promise<void> {
  if (verifyAssignAccess(role, user, collection)) {
    const userDocument = await dataStore.findUserById(userId)
        .catch(e => reportError(e));
    if (userDocument !== null && typeof(userDocument) !== 'undefined') {
      const formattedAccessGroup = `${role}@${collection}`;
      switch (action) {
        case ROLE_ACTIONS.ASSIGN:
          if (!hasAccessGroup(formattedAccessGroup, userDocument)) {
            dataStore.assignAccessGroup(userId, formattedAccessGroup)
                            .catch(e => reportError(e));
          } else {
            throw new ResourceError(
                            'Access Group Already Exists on this User',
                            ResourceErrorReason.BAD_REQUEST,
                        );
          }
          break;
        case ROLE_ACTIONS.REMOVE:
          if (hasAccessGroup(formattedAccessGroup, userDocument)) {
            await dataStore.removeAccessGroup(userId, formattedAccessGroup)
          } else {
            throw new ResourceError(
                            'Access Group Does Not Exist on User',
                            ResourceErrorReason.BAD_REQUEST
                        );
          }
          break;
        default:
          throw new ServiceError(
                        ServiceErrorReason.INTERNAL
                    );
      }
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