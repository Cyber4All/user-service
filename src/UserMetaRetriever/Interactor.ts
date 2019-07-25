import { UserMetaRetriever as Module } from '.';
import { UserToken } from './typings';
import { authorizeRequest, requesterIsAdmin, requesterIsAdminOrEditor, userIsAdminOrEditor } from '../shared/AuthorizationManager';
import { handleError, ResourceError, ResourceErrorReason } from '../Error';
import { UserMetaDatastore } from './interfaces';

/**
 * Encapsulates Drivers used within this interactor in a namespace
 */
namespace Drivers {
  export const datastore = () => Module.resolveDependency(UserMetaDatastore);
}

/**
 * Retrieves roles for specified user
 *
 * @export
 * @param {UserToken} userToken [Data about the requester]
 * @param {string} id [Id of the User to get roles for]
 * @returns {Promise<{ roles: string[] }>}
 */
export async function getUserRoles({
  userToken,
  id
}: {
  userToken: UserToken;
  id: string;
}): Promise<{ roles: string[] }> {
  try {
    validateRequestParams({ params: [id], mustProvide: ['id'] });
    authorizeRequest([requesterIsAdmin(userToken)]);

    const roles = await Drivers.datastore().fetchUserRoles(id);
    if (roles == null) {
      throw new ResourceError(
        `Unable to find roles for user: ${id}.`,
        ResourceErrorReason.NOT_FOUND
      );
    }
    return { roles };
  } catch (e) {
    handleError(e);
  }
}

/**
 * Validates all required values are provided for request
 *
 * @param {any[]} params
 * @param {string[]} [mustProvide]
 * @returns {(void | never)}
 */
function validateRequestParams({
  params,
  mustProvide
}: {
  params: any[];
  mustProvide?: string[];
}): void | never {
  const values = [...params].map(val => {
    if (typeof val === 'string') {
      val = val.trim();
    }
    return val;
  });
  if (
    values.includes(null) ||
    values.includes('null') ||
    values.includes(undefined) ||
    values.includes('undefined') ||
    values.includes('')
  ) {
    const multipleParams = mustProvide.length > 1;
    let message = 'Invalid parameters provided';
    if (Array.isArray(mustProvide)) {
      message = `Must provide ${multipleParams ? '' : 'a'} valid value${
        multipleParams ? 's' : ''
      } for ${mustProvide}`;
    }
    throw new ResourceError(message, ResourceErrorReason.BAD_REQUEST);
  }
}
