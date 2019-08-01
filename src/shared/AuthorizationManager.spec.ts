import { requesterIsAdmin, requesterIsAdminOrEditor, authorizeRequest } from './AuthorizationManager';
import { UserToken } from './typings';
import { ResourceError } from '../Error';

describe('AuthorizationManager', () => {
  let userToken: UserToken;

  beforeEach(() => {
    userToken = {
      username: 'username',
      id: '123',
      email: 'email',
      emailVerified: true,
      accessGroups: [],
      organization: '',
      name: ''
    };
  });

  describe('requesterIsAdmin', () => {
    it('should return true (Only admin accessGroup)', () => {
      userToken.accessGroups = ['admin'];
      expect(requesterIsAdmin(userToken)).toBe(true);
    });
    it('should return true (All accessGroups)', () => {
      userToken.accessGroups = [
          'admin',
          'editor',
          'curator@collection',
          'reviewer@collection'
        ];
      expect(requesterIsAdmin(userToken)).toBe(true);
    });
    it('should return false (No accessGroups)', () => {
      userToken.accessGroups = [];
      expect(requesterIsAdmin(userToken)).toBe(false);
    });
    it('should return false (Only editor accessGroup)', () => {
      userToken.accessGroups = ['editor'];
      expect(requesterIsAdmin(userToken)).toBe(false);
    });
    it('should return false (Only curator@collection accessGroup)', () => {
      userToken.accessGroups = ['curator@collection'];
      expect(requesterIsAdmin(userToken)).toBe(false);
    });
    it('should return false (Only reviewer@collection accessGroup)', () => {
      userToken.accessGroups = ['reviewer@collection'];
      expect(requesterIsAdmin(userToken)).toBe(false);
    });
    it('should return false (All accessGroups except admin)', () => {
      userToken.accessGroups = [
          'editor',
          'curator@collection',
          'reviewer@collection'
        ];
      expect(requesterIsAdmin(userToken)).toBe(false);
    });
    it('should return false (undefined userToken)', () => {
            // @ts-ignore
      userToken = undefined;
      expect(requesterIsAdmin(userToken)).toBe(false);
    });
    it('should return false (undefined accessGroups)', () => {
            // @ts-ignore
      userToken.accessGroups = undefined;
      expect(requesterIsAdmin(userToken)).toBe(false);
    });
  });

  describe('requesterIsAdminOrEditor', () => {
    it('should return true (Only admin accessGroup)', () => {
      userToken.accessGroups = ['admin'];
      expect(requesterIsAdminOrEditor(userToken)).toBe(true);
    });
    it('should return true (Only editor accessGroup)', () => {
      userToken.accessGroups = ['editor'];
      expect(requesterIsAdminOrEditor(userToken)).toBe(true);
    });
    it('should return true (All accessGroups)', () => {
      userToken.accessGroups = [
          'admin',
          'editor',
          'curator@collection',
          'reviewer@collection'
        ];
      expect(requesterIsAdminOrEditor(userToken)).toBe(true);
    });
    it('should return false (No accessGroups)', () => {
      userToken.accessGroups = [];
      expect(requesterIsAdminOrEditor(userToken)).toBe(false);
    });
    it('should return false (Only curator@collection accessGroup)', () => {
      userToken.accessGroups = ['curator@collection'];
      expect(requesterIsAdminOrEditor(userToken)).toBe(false);
    });
    it('should return false (Only reviewer@collection accessGroup)', () => {
      userToken.accessGroups = ['reviewer@collection'];
      expect(requesterIsAdminOrEditor(userToken)).toBe(false);
    });
    it('should return false (All accessGroups except admin and editor)', () => {
      userToken.accessGroups = ['curator@collection', 'reviewer@collection'];
      expect(requesterIsAdminOrEditor(userToken)).toBe(false);
    });
    it('should return false (undefined userToken)', () => {
            // @ts-ignore
      userToken = undefined;
      expect(requesterIsAdminOrEditor(userToken)).toBe(false);
    });
    it('should return false (undefined accessGroups)', () => {
            // @ts-ignore
      userToken.accessGroups = undefined;
      expect(requesterIsAdminOrEditor(userToken)).toBe(false);
    });
  });

  describe('authorizeRequest', () => {
    it('should return void', () => {
      expect(authorizeRequest([true])).toBeUndefined();
    });
    it('should throw ResourceError (Only false)', () => {
      try {
          authorizeRequest([false]);
        } catch (e) {
          expect(e).toBeInstanceOf(ResourceError);
        }
    });
    it('should throw ResourceError (true and false)', () => {
      try {
          authorizeRequest([true, false]);
        } catch (e) {
          expect(e).toBeInstanceOf(ResourceError);
        }
    });
  });
});
