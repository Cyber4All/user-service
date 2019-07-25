import { UserMetaDatastore } from '../../../interfaces';
import { userRoles } from '../../MockStore';
import { AuthUser } from '../../../typings';
export class MockUserMetaDatastore implements UserMetaDatastore {
  fetchUser(id: string): Promise<AuthUser> {
    return Promise.resolve(null);
  }
  fetchUserRoles(_: string): Promise<string[]> {
    return Promise.resolve(userRoles);
  }
}
