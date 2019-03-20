import { UserToken } from '../types/user-token';
import { DataStore } from '../interfaces/interfaces';
import { verifyAssignAccess } from './AuthManager';
import { reportError } from '../drivers/SentryConnector';
import { UserDocument } from '../types/user-document';

const ROLE_ACTIONS = {
    ASSIGN: 'assign',
    REMOVE: 'remove',
};

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
                        throw new Error('Access Group Already Exists on this User');
                    }
                    break;
                case ROLE_ACTIONS.REMOVE:
                    if (hasAccessGroup(formattedAccessGroup, userDocument)) {
                        dataStore.removeAccessGroup(userId, formattedAccessGroup)
                            .catch(e => reportError(e));
                    } else {
                        throw new Error('Access Group Does Not Exist on User');
                    }
                    break;
                default:
                    throw new Error('Invalid Action Request');
            }
        } else {
            throw new Error('User Not Found');
        }
  } else {
    throw new Error('Invalid Access');
  }
}

function hasAccessGroup(formattedAccessGroup: string, user: UserDocument): boolean {
    return user.accessGroups.includes(formattedAccessGroup);
}
