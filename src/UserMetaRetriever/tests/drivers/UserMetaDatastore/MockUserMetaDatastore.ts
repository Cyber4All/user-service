import { UserMetaDatastore } from '../../../interfaces';
import { userRoles } from '../../MockStore';
export class MockUserMetaDatastore implements UserMetaDatastore {
  fetchUserRoles(_: string): Promise<string[]> {
    return Promise.resolve(userRoles);
  }
}
