import { RoleDatastore } from '../../../interfaces';
import { userRoles } from '../../MockStore';
export class MockRoleDatastore implements RoleDatastore {
  fetchUserRoles(_: string): Promise<string[]> {
    return Promise.resolve(userRoles);
  }
}
