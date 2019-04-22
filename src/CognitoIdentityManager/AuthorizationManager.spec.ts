import * as auth from './AuthorizationManager';
import { UserToken } from './typings';
import { ResourceError } from '../Error';

describe('LearningObjectDownload: AuthorizationManager', () => {
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

  describe('requesterIsOwner', () => {
    it('should return true (Id matches)', () => {
      expect(
        auth.requesterIsOwner({
          userId: userToken.id,
          requester: userToken
        })
      ).toBe(true);
    });
    it('should return false (Id does not match)', () => {
      expect(
        auth.requesterIsOwner({
          userId: 'not requester',
          requester: userToken
        })
      ).toBe(false);
    });
    it('should return false (userToken undefined)', () => {
      // @ts-ignore
      userToken = undefined;
      expect(
        auth.requesterIsOwner({
          userId: 'not requester',
          requester: userToken
        })
      ).toBe(false);
    });
  });

  describe('requesterIsAdmin', () => {
    it('should return true (Only admin accessGroup)', () => {
      userToken.accessGroups = ['admin'];
      expect(auth.requesterIsAdmin(userToken)).toBe(true);
    });
    it('should return true (All accessGroups)', () => {
      userToken.accessGroups = [
        'admin',
        'editor',
        'curator@collection',
        'reviewer@collection'
      ];
      expect(auth.requesterIsAdmin(userToken)).toBe(true);
    });
    it('should return false (No accessGroups)', () => {
      userToken.accessGroups = [];
      expect(auth.requesterIsAdmin(userToken)).toBe(false);
    });
    it('should return false (Only editor accessGroup)', () => {
      userToken.accessGroups = ['editor'];
      expect(auth.requesterIsAdmin(userToken)).toBe(false);
    });
    it('should return false (Only curator@collection accessGroup)', () => {
      userToken.accessGroups = ['curator@collection'];
      expect(auth.requesterIsAdmin(userToken)).toBe(false);
    });
    it('should return false (Only reviewer@collection accessGroup)', () => {
      userToken.accessGroups = ['reviewer@collection'];
      expect(auth.requesterIsAdmin(userToken)).toBe(false);
    });
    it('should return false (All accessGroups except admin)', () => {
      userToken.accessGroups = [
        'editor',
        'curator@collection',
        'reviewer@collection'
      ];
      expect(auth.requesterIsAdmin(userToken)).toBe(false);
    });
    it('should return false (undefined userToken)', () => {
      // @ts-ignore
      userToken = undefined;
      expect(auth.requesterIsAdmin(userToken)).toBe(false);
    });
    it('should return false (undefined accessGroups)', () => {
      // @ts-ignore
      userToken.accessGroups = undefined;
      expect(auth.requesterIsAdmin(userToken)).toBe(false);
    });
  });

  describe('requesterIsAdminOrEditor', () => {
    it('should return true (Only admin accessGroup)', () => {
      userToken.accessGroups = ['admin'];
      expect(auth.requesterIsAdminOrEditor(userToken)).toBe(true);
    });
    it('should return true (Only editor accessGroup)', () => {
      userToken.accessGroups = ['editor'];
      expect(auth.requesterIsAdminOrEditor(userToken)).toBe(true);
    });
    it('should return true (All accessGroups)', () => {
      userToken.accessGroups = [
        'admin',
        'editor',
        'curator@collection',
        'reviewer@collection'
      ];
      expect(auth.requesterIsAdminOrEditor(userToken)).toBe(true);
    });
    it('should return false (No accessGroups)', () => {
      userToken.accessGroups = [];
      expect(auth.requesterIsAdminOrEditor(userToken)).toBe(false);
    });
    it('should return false (Only curator@collection accessGroup)', () => {
      userToken.accessGroups = ['curator@collection'];
      expect(auth.requesterIsAdminOrEditor(userToken)).toBe(false);
    });
    it('should return false (Only reviewer@collection accessGroup)', () => {
      userToken.accessGroups = ['reviewer@collection'];
      expect(auth.requesterIsAdminOrEditor(userToken)).toBe(false);
    });
    it('should return false (All accessGroups except admin and editor)', () => {
      userToken.accessGroups = ['curator@collection', 'reviewer@collection'];
      expect(auth.requesterIsAdminOrEditor(userToken)).toBe(false);
    });
    it('should return false (undefined userToken)', () => {
      // @ts-ignore
      userToken = undefined;
      expect(auth.requesterIsAdminOrEditor(userToken)).toBe(false);
    });
    it('should return false (undefined accessGroups)', () => {
      // @ts-ignore
      userToken.accessGroups = undefined;
      expect(auth.requesterIsAdminOrEditor(userToken)).toBe(false);
    });
  });

  describe('authorizeRequest', () => {
    it('should return void', () => {
      expect(auth.authorizeRequest([true])).toBeUndefined();
    });
    it('should throw ResourceError (Only false)', () => {
      try {
        auth.authorizeRequest([false]);
      } catch (e) {
        expect(e).toBeInstanceOf(ResourceError);
      }
    });
    it('should throw ResourceError (true and false)', () => {
      try {
        auth.authorizeRequest([true, false]);
      } catch (e) {
        expect(e).toBeInstanceOf(ResourceError);
      }
    });
  });
});
