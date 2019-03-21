import { UserToken } from '../types/user-token';
import { UserDocument } from '../types/user-document';
import { ServiceError, ServiceErrorReason } from '../Error';

const ROLES = {
  ADMIN: 'admin',
  CURATOR: 'curator',
  REVIEWER: 'reviewer'
};

/**
 * Checks if the user has a specified access group string
 * @export
 * @param params
 * @property { string } formattedAccessGroup accessGroup string formatted as `role@collection`
 * @property { UserDocument } user user object fetched from database
 * @returns { boolean }
 */
export function hasAccessGroup(formattedAccessGroup: string, user: UserDocument): boolean {
  return user.accessGroups.includes(formattedAccessGroup);
}

/**
 * Checks if the user is a member of a specifed collection
 * @export
 * @param params
 * @property { string } collection name of a collection
 * @property { UserDocument } user user object fetched from database
 * @returns { boolean }
 */
export function isCollectionMember(collection: string, user: UserDocument): boolean {
  const filteredAccessGroups = user.accessGroups.filter(group => group.includes('@'));
  if (!(filteredAccessGroups.length > 0)) {
    return false;
  }
  const collections = filteredAccessGroups.map(group => parseCollection(group));
  return collections.includes(collection);
}

/**
 * Checks if a user is a curator of a specified collection
 * @export
 * @param params
 * @property { UserToken } user user to verify
 * @property { collection } collection name of a collection
 * @returns { boolean }
 */
export function verifyCollectionName(
    user: UserToken,
    collection: string,
  ): boolean {
  return user.accessGroups.includes(`${ROLES.CURATOR}@${collection}`);
}

/**
 * Checks if a user has the privilege to modify another user's collection roles
 * @export
 * @param params
 * @property { string } role role to modify
 * @property { UserToken } user user to check
 * @property { string } collection name of a collection
 * @returns { boolean }
 */
export function verifyAssignAccess(
    role: string,
    user: UserToken,
    collection: string,
): boolean {
  switch (role) {
    case ROLES.CURATOR:
      return isAdmin(user);
    case ROLES.REVIEWER:
      return isAdmin(user) || isCurator(user, collection);
    default:
      return false;
  }
}

/**
 * Given a formatted access group string (`role@collection`), parse the collection
 * @param params
 * @property { string } accessGroup formatted accessGroup string to be parsed
 * @returns { string }
 */
function parseCollection(accessGroup: string): string {
  if (!(accessGroup.includes('@'))) {
    throw new ServiceError(ServiceErrorReason.INTERNAL);
  }
  return accessGroup.split('@')[1];
}

/**
 * Checks if a user has admin privilege
 * @param params
 * @property { UserToken } user user to check privilege on
 * @returns { boolean }
 */
function isAdmin(user: UserToken): boolean {
  return user.accessGroups.includes(ROLES.ADMIN);
}

/**
 * Checks if a user has curator privilege
 * @param params
 * @property { UserToken } user user to check privilege on
 * @property { string } collection collection that user is curator of
 * @returns { boolean }
 */
function isCurator(user: UserToken, collection: string): boolean {
  return user.accessGroups.includes(`${ROLES.CURATOR}@${collection}`);
}
