import * as encoder from './TokenEncoder';
import { UserToken } from './typings';

describe('LearningObjectDownload: TokenEncoder', () => {
  const userToken: UserToken = {
    id: '123',
    username: 'hello',
    name: 'hello world',
    email: 'someemail@email.com',
    emailVerified: true,
    organization: '',
    accessGroups: []
  };

  describe('encodeToken', () => {
    it('should convert object to jwt string', () => {
      process.env.KEY = 'shhh im a secret'
      const token = encoder.encodeToken(userToken);
      expect(typeof token).toBe('string');
    });
  });
});
