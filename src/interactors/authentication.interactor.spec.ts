import MockDriver from '../drivers/MockDriver';
import { MOCK_OBJECTS } from '../tests/mocks';
import { MockHashDriver } from '../drivers/MockHashDriver';
import { MockCognitoGateway } from '../drivers/MockCognitoGateway';
import { AuthUser } from '../shared/typings';
import { HttpFileAccessIdentityGateway } from '../gateways/file-access-identities/HttpFileAccessIdentityGateway';
const driver = new MockDriver(); // DataStore
const hasher = new MockHashDriver(); // Hasher
const cognitoGateway = new MockCognitoGateway();

let interactor: any;

describe('AuthenticationInteractor', () => {
  beforeAll(async () => {
    jest.doMock('../drivers/TokenManager', () => {
      return {
        generateBearerToken: (user: AuthUser) => {
          return 'somebearertokenhere'
        }
      }
    });

    const mockCreateFileAccessIdentity = async (_: any) => {
      return Promise.resolve('somefileaccessidentityhere');
    }
    HttpFileAccessIdentityGateway.createFileAccessIdentity = mockCreateFileAccessIdentity.bind(HttpFileAccessIdentityGateway)

    interactor = await import('./AuthenticationInteractor');
  })
  describe('#login', () => {
    it('should pass for correct username and password', async () => {
      await expect(
        interactor.login(
          driver,
          hasher,
          MOCK_OBJECTS.USERNAME,
          MOCK_OBJECTS.PASSWORD,
          cognitoGateway
        )
      ).resolves.not.toThrowError();
    });

    it('should fail for incorrect password', async () => {
      await expect(
        interactor.login(
          driver,
          hasher,
          MOCK_OBJECTS.USERNAME,
          MOCK_OBJECTS.EMPTY_STRING,
          cognitoGateway
        )
      ).rejects.toThrowError();
    });
    it('should fail for incorrect user', async () => {
      await expect(
        interactor.login(
          driver,
          hasher,
          MOCK_OBJECTS.EMPTY_STRING,
          MOCK_OBJECTS.PASSWORD,
          cognitoGateway
        )
      ).rejects.toThrowError();
    });
    it('should fail for empty input', async () => {
      await expect(
        interactor.login(
          driver,
          hasher,
          MOCK_OBJECTS.EMPTY_STRING,
          MOCK_OBJECTS.EMPTY_STRING,
          cognitoGateway
        )
      ).rejects.toThrowError();
    });
  });
});

describe('AuthenticationInteractor', () => {
  describe('#register', () => {
    it('should fail for existing username', async () => {
      const registrationRequest = {
        username: 'thisusernameexists',
        name: 'So Fun',
        email: 'cool@test.com',
        organization: 'towson university',
        password: 'mypassissecure',
        bio: '',
      } as any;

      await expect(
        interactor.register(driver, hasher, registrationRequest, cognitoGateway)
      ).rejects.toThrowError()
    });

    it('should fail for existing email', async () => {
      const registrationRequest = {
        username: 'thisdoesntexist',
        name: 'So Fun',
        email: 'cool@test.com',
        organization: 'towson university',
        password: 'mypassissecure',
        bio: '',
      } as any;
      await expect(
        interactor.register(driver, hasher, registrationRequest, cognitoGateway)
      ).rejects.toThrowError()
    });

    it('should return a lowercased user on success', async () => {
      const registrationRequest = {
        username: 'thisDOESNTexist',
        name: 'So Fun',
        email: 'thisemaildoesntexist@test.com',
        organization: 'towson university',
        password: 'myPassis$ecure3',
        bio: '',
      } as any;

      const response = await interactor.register(driver, hasher, registrationRequest, cognitoGateway);
      expect(response.user.username).toBe(registrationRequest.username.toLowerCase())
    });
  });
});

describe('AuthenticationInteractor', () => {
  describe('#passwordMatch', () => {
    it('should pass for correct db, username, and password', async () => {
      await expect(
        await interactor.passwordMatch(
          driver,
          hasher,
          MOCK_OBJECTS.USERNAME,
          MOCK_OBJECTS.PASSWORD
        )
      ).toBeTruthy();
    });
  });

  describe('#isValidUsername', () => {
    it('should fail for usernames longer than 20 characters', () => {
      expect(interactor.isValidUsername(MOCK_OBJECTS.LONG_USERNAME)).toBeFalsy();
    });
    it('should fail for usernames shorter than 3 characters', () => {
      expect(interactor.isValidUsername(MOCK_OBJECTS.SHORT_USERNAME)).toBeFalsy();
    });
    it('should pass for usernames shorter than 20 characters', () => {
      expect(interactor.isValidUsername(MOCK_OBJECTS.VALID_LONG_USERNAME)).toBeTruthy();
    });
    it('should pass for usernames with exactly 3 characters', () => {
      expect(interactor.isValidUsername(MOCK_OBJECTS.VALID_SHORT_USERNAME)).toBeTruthy();
    });
    it('should pass for usernames with exactly 20 characters', () => {
      expect(interactor.isValidUsername(MOCK_OBJECTS.VALID_MAX_LENGTH_USERNAME)).toBeTruthy();
    });
  });
});
