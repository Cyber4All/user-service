import { User } from './user';

/**
 * An interface representation of an AuthUser which includes properties used to authenticate and authorize a users
 *
 * @export
 * @interface AuthUser
 * @extends {User}
 */
export interface AuthUser extends User{
  /**
   * List of permission groups the user belongs to
   */
  accessGroups: string[];
  /**
   * The user's password hash
   */
  password: string;
}
