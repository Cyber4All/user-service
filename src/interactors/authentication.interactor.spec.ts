import { isValidUsername } from './AuthenticationInteractor';

describe('AuthenticationInteractor', () => {
  describe('#isValidUsername', () => {
    it('should fail for usernames longer than 20 characters', () => {
      expect(isValidUsername('abcdefghijklmnopqrstuvwxyz')).toBeFalsy();
    });
    it('should fail for usernames shorter than 3 characters', () => {
      expect(isValidUsername('12')).toBeFalsy();
    });
    it('should pass for usernames shorter than 20 characters', () => {
      expect(isValidUsername('myshortusername')).toBeTruthy();
    });
    it('should pass for usernames with exactly 3 characters', () => {
      expect(isValidUsername('123')).toBeTruthy();
    });
    it('should pass for usernames with exactly 20 characters', () => {
      expect(isValidUsername('aaaaaaaaaaaaaaaaaaaa')).toBeTruthy();
    });
  });
});
