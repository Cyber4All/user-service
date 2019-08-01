import { UserToken, AuthUser } from './typings';
import { ResourceError, ResourceErrorReason } from '../Error';

export enum AccessGroup {
    ADMIN = 'admin',
    EDITOR = 'editor',
    CURATOR = 'curator',
    REVIEWER = 'reviewer'
  }

  /**
 * Checks if requester is an Admin by checking if their `accessGroups` contain the admin privilege
 *
 * @export
 * @param {UserToken} requester [Token data of the requester]
 * @returns {boolean}
 */
export function requesterIsAdmin(requester: UserToken): boolean {
  return (
      requester != null &&
      Array.isArray(requester.accessGroups) &&
      requester.accessGroups.includes(AccessGroup.ADMIN)
  );
}

  /**
   * Checks if requester is an Editor by checking if their `accessGroups` contain the editor privilege
   *
   * @export
   * @param {UserToken} requester [Token data of the requester]
   * @returns {boolean}
   */
export function requesterIsEditor(requester: UserToken): boolean {
  return (
      requester != null &&
      Array.isArray(requester.accessGroups) &&
      requester.accessGroups.includes(AccessGroup.EDITOR)
    );
}

  /**
   * Checks if requester is an Admin or Editor by checking if their `accessGroups` contain the admin or editor privileges
   *
   * @export
   * @param {UserToken} requester [Token data of the requester]
   * @returns {boolean}
   */
export function requesterIsAdminOrEditor(requester: UserToken): boolean {
  return requesterIsAdmin(requester) || requesterIsEditor(requester);
}

  /**
   * Checks if user is an Admin or Editor by checking if their `accessGroups` contain the admin or editor privileges
   *
   * @export
   * @param {AuthUser} user [Token data of the requester]
   * @returns {boolean}
   */
export function userIsAdminOrEditor(user: AuthUser): boolean {
  return requesterIsAdmin(user) || requesterIsEditor(user);
}

  /**
 * Checks if request should be authorized by checking if `authorizationCases` contains `true`.
 *
 * @export
 * @param {boolean[]} authorizationCases [List of boolean values from the result of an authorization check]
 * @param {string} message [The error message to set if checks fail]
 */
export function authorizeRequest(authorizationCases: boolean[], message?: string): never | void {
  if (!authorizationCases.includes(true)) {
    throw new ResourceError(
        message || 'Invalid access',
        ResourceErrorReason.INVALID_ACCESS
      );
  }
}
