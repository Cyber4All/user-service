import {
  login,
  register,
  passwordMatch,
  isValidUsername
} from './AuthenticationInteractor';
import MockDriver from '../drivers/MockDriver';
import { MOCK_OBJECTS } from '../tests/mocks';
import { MockHashDriver } from '../drivers/MockHashDriver';
import { MockCognitoGateway } from '../drivers/MockCognitoGateway';
const driver = new MockDriver(); // DataStore
const hasher = new MockHashDriver(); // Hasher
const expect = require('chai').expect;
const cognitoGateway = new MockCognitoGateway();
describe('AuthenticationInteractor', () => {
  describe('#login', () => {
    it('should pass for correct username and password', done => {
      login(
        driver,
        hasher,
        MOCK_OBJECTS.USERNAME,
        MOCK_OBJECTS.PASSWORD,
        cognitoGateway
      )
        .then(val => {
          expect(val).to.be.a('object');
          done();
        })
        .catch(error => {
          console.log(error);
          expect.fail();
          done();
        });
    });

    it('should fail for incorrect password', done => {
      login(
        driver,
        hasher,
        MOCK_OBJECTS.USERNAME,
        MOCK_OBJECTS.EMPTY_STRING,
        cognitoGateway
      )
        .then(val => {
          expect.fail();
          done();
        })
        .catch(error => {
          expect(error).to.be.a('object');
          done();
        });
    });
    it('should fail for incorrect user', done => {
      login(
        driver,
        hasher,
        MOCK_OBJECTS.EMPTY_STRING,
        MOCK_OBJECTS.PASSWORD,
        cognitoGateway
      )
        .then(val => {
          expect.fail();
          done();
        })
        .catch(error => {
          expect(error).to.be.a('object');
          done();
        });
    });
    it('should fail for empty input', done => {
      login(
        driver,
        hasher,
        MOCK_OBJECTS.EMPTY_STRING,
        MOCK_OBJECTS.EMPTY_STRING,
        cognitoGateway
      )
        .then(val => {
          expect.fail();
          done();
        })
        .catch(error => {
          expect(error).to.be.a('object');
          done();
        });
    });
  });
});

describe('AuthenticationInteractor', () => {
  describe('#register', () => {
    it('should fail for existing username', done => {
      login(
        driver,
        hasher,
        MOCK_OBJECTS.USERNAME,
        MOCK_OBJECTS.PASSWORD,
        cognitoGateway
      )
        .then(val => {
          return register(driver, hasher, val['user'], cognitoGateway)
            .then(val => {
              expect.fail();
              done();
            })
            .catch(error => {
              expect(val).to.be.a('object');
              done();
            });
        })
        .catch(error => {
          expect.fail();
          done();
        });
    });
    it('should fail for existing email', async done => {
      const registrationRequest = {
        username: 'areallycoolhuman',
        name: 'So Fun',
        email: 'cool@test.com',
        organization: 'towson university',
        password: 'mypassissecure',
        bio: '',
      } as any;
      try {
        await register(driver, hasher, registrationRequest, cognitoGateway);
        expect.fail();
      } catch (error) {
        expect(error).to.be.a('error');
        done();
      }
    });
    it('should return a lowercased user on success', async () => {
      const registrationRequest = {
        username: 'aCAPITALIZEDreallycoolhuman',
        name: 'So Fun',
        email: 'thisemaildoesntexist@test.com',
        organization: 'towson university',
        password: 'mypassissecure',
        bio: '',
      } as any;

      const registrationResponse =
        await register(driver, hasher, registrationRequest, cognitoGateway);
      expect(registrationResponse.user.username).toBe(registrationRequest.username.toLowerCase())
    })
  });
});

describe('AuthenticationInteractor', () => {
  describe('#passwordMatch', () => {
    it('should pass for correct db, username, and password', done => {
      passwordMatch(
        driver,
        hasher,
        MOCK_OBJECTS.USERNAME,
        MOCK_OBJECTS.PASSWORD
      )
        .then(val => {
          expect(val).to.be.true;
          done();
        })
        .catch(error => {
          expect.fail();
          done();
        });
    });
  });

  describe('#isValidUsername', () => {
    it('should fail for usernames longer than 20 characters', () => {
      expect(isValidUsername(MOCK_OBJECTS.LONG_USERNAME)).to.be.false;
    });
    it('should fail for usernames shorter than 3 characters', () => {
      expect(isValidUsername(MOCK_OBJECTS.SHORT_USERNAME)).to.be.false;
    });
    it('should pass for usernames shorter than 20 characters', () => {
      expect(isValidUsername(MOCK_OBJECTS.VALID_LONG_USERNAME)).to.be.true;
    });
    it('should pass for usernames with exactly 3 characters', () => {
      expect(isValidUsername(MOCK_OBJECTS.VALID_SHORT_USERNAME)).to.be.true;
    });
    it('should pass for usernames with exactly 20 characters', () => {
      expect(isValidUsername(MOCK_OBJECTS.VALID_MAX_LENGTH_USERNAME)).to.be
        .true;
    });
  });
});
