import { UserToken } from '../types/user-token';
import { UserDocument } from '../types/user-document';

const ROLES = {
  ADMIN: 'admin',
  CURATOR: 'curator',
  REVIEWER: 'reviewer'
};

export function hasAccessGroup(formattedAccessGroup: string, user: UserDocument): boolean {
  return user.accessGroups.includes(formattedAccessGroup);
}

export function verifyCollectionName(
    user: UserToken,
    collection: string,
  ): boolean {
  return user.accessGroups.includes(`${ROLES.CURATOR}@${collection}`);
}

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

function isAdmin(user: UserToken) {
  return user.accessGroups.includes(ROLES.ADMIN);
}

function isCurator(user: UserToken, collection: string): boolean {
  return user.accessGroups.includes(`${ROLES.CURATOR}@${collection}`);
}
