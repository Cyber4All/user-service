import { User, AuthUser } from '../typings';

/**
 * Maps user data to the User type
 *
 * Used to verify that the type matches the User interface
 * and doesn't have any additional, potentially sensitive data attached
 *
 * @export
 * @param {User} user
 * @returns {User}
 */
export function mapUserDataToUser(user: User): User {
  return {
      id: user.id,
      bio: user.bio,
      cognitoIdentityId: user.cognitoIdentityId,
      createdAt: user.createdAt,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      organization: user.organization,
      username: user.username,
    };
}

/**
 * Maps user data to the AuthUser type
 *
 * Used to verify that the type matches the AuthUser interface
 *
 * @export
 * @param {AuthUser} user
 * @returns {AuthUser}
 */
export function mapUserDataToAuthUser(user: AuthUser): AuthUser {
  return {
      ...mapUserDataToUser(user),
      accessGroups: user.accessGroups,
      password: user.password
    };
}
