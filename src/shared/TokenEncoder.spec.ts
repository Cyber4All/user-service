import * as encoder from './TokenEncoder';
import { UserToken } from '../types/user-token';

describe('LearningObjectDownload: TokenEncoder', () => {
  const userToken: UserToken = {
    username: 'hello',
    name: 'hello world',
    email: 'someemail@email.com',
    emailVerified: true,
    organization: '',
    accessGroups: []
  };
  describe('encodeToken', () => {
    it('should convert object to jwt string', () => {
      const token = encoder.encodeToken(userToken);
      expect(typeof token).toBe('string');
    });
  });
});
