import { UserToken } from '../types/user-token';
import { UserDocument } from '../types/user-document';
import { access } from 'fs';
import { ServiceError, ServiceErrorReason } from '../Error';

const ROLES = {
  ADMIN: 'admin',
  CURATOR: 'curator',
  REVIEWER: 'reviewer'
};

export function hasAccessGroup(formattedAccessGroup: string, user: UserDocument): boolean {
  return user.accessGroups.includes(formattedAccessGroup);
}

export function isCollectionMember(collection: string, user: UserDocument): boolean {
  const filteredAccessGroups = user.accessGroups.filter(group => group.includes('@'));
  if (!(filteredAccessGroups.length > 0)) {
    return false;
  }
  const collections = filteredAccessGroups.map(group => parseCollection(group));
  return collections.includes(collection);
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

function parseCollection(accessGroup: string): string {
  if (accessGroup.includes('@')) {
    throw new ServiceError(ServiceErrorReason.INTERNAL);
  }
  return accessGroup.split('@')[0];
}

function isAdmin(user: UserToken) {
  return user.accessGroups.includes(ROLES.ADMIN);
}

function isCurator(user: UserToken, collection: string): boolean {
  return user.accessGroups.includes(`${ROLES.CURATOR}@${collection}`);
}
