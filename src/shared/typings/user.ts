
/**
 * The interface representation of a User
 *
 * @export
 * @interface User
 */
export interface User{
    /**
     * Unique identifier of the user
     */
  id: string;
    /**
     * A brief profile description of the user
     */
  bio: string;
    /**
     * The Cognito Identity Id of the user. Used to reference set of permissions the user has over AWS services
     */
  cognitoIdentityId?: string;
    /**
     * The date the user was created
     */
  createdAt: string;
    /**
     * The email address of the user
     */
  email: string;
    /**
     * Whether or not the user's provided email address has been verified
     */
  emailVerified: boolean;
    /**
     * The full name of the user
     */
  name: string;
    /**
     * The organization the user is apart of
     */
  organization: string;
    /**
     * Human readable unique identifier of the user
     */
  username: string;
}
