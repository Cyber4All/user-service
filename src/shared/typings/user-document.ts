export interface UserDocument {
  _id: string;
  username: string;
  name: string;
  email: string;
  organization: string;
  password: string;
  emailVerified: boolean;
  bio: string;
  createdAt: string;
  accessGroups: string[];
}
