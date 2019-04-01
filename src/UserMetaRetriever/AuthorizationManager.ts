/**
 * Set of reusable functions used to authorize requests within this module
 */

import { UserToken } from './typings';
import { ResourceError, ResourceErrorReason } from '../Error';

enum AccessGroup {
  ADMIN = 'admin'
}

/**
 * Checks if requester is an Admin by checking if their `accessGroups` contain the admin privilege
 *
 * @export
 * @param {UserToken} userToken [Token data of the requester]
 * @returns {boolean}
 */
export function requesterIsAdmin(userToken: UserToken): boolean {
  return (
    userToken != null &&
    Array.isArray(userToken.accessGroups) &&
    userToken.accessGroups.includes(AccessGroup.ADMIN)
  );
}

/**
 * Checks if request should be authorized by checking if `authorizationCases` contains `true`.
 *
 * @export
 * @param {boolean[]} authorizationCases [List of boolean values from the result of an authorization check]
 */
export function authorizeRequest(authorizationCases: boolean[]) {
  if (!authorizationCases.includes(true)) {
    throw new ResourceError(
      'Invalid access',
      ResourceErrorReason.INVALID_ACCESS
    );
  }
}
