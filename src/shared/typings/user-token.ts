export interface UserToken {
  id: string;
  username: string;
  name: string;
  email: string;
  organization: string;
  emailVerified: boolean;
  accessGroups: string[];
}
