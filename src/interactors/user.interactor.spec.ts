import { UserInteractor } from '../interactors/interactors';
import { BcryptDriver } from '../drivers/BcryptDriver';
import MockDriver from '../drivers/MockDriver';
import { MOCK_OBJECTS } from '../tests/mocks';
const expect = require('chai').expect;
const driver = new MockDriver(); // DataStore
const hasher = new BcryptDriver(10); // Hasher

describe('searchUsers', () => {
  it('should return an array of users', (done) => {
    return UserInteractor.searchUsers(driver, MOCK_OBJECTS.USERNAME_QUERY)
      .then((val) => {
        expect(val, 'users is not an array!').to.exist;
        done();
      })
      .catch((error) => {
        expect.fail();
        done();
      });
  });
});

describe('findUser', () => {
  it('should return a user ID', (done) => {
    return UserInteractor.findUser(driver, MOCK_OBJECTS.USERNAME)
      .then((val) => {
        expect(val, 'Expected user was not returned!').to.be.a('string');
        done();
      })
      .catch((error) => {
        expect.fail();
        done();
      });
  });
  it('should return an error message', (done) => {
    // Here we are passing an incorrect parameter for DataStore
    return UserInteractor.findUser(this.driver, MOCK_OBJECTS.USERNAME)
      .then((val) => {
        expect.fail();
        done();
      })
      .catch((error) => {
        expect(error, 'Expected user was not returned!').to.be.a('string');
        done();
      });
  });
});

describe('updatePassword', () => {
  it('should return a user', (done) => {
    return UserInteractor.updatePassword(driver, hasher, MOCK_OBJECTS.EMAIL, MOCK_OBJECTS.PASSWORD)
      .then((val) => {
        expect(val, 'Expected user was not returned!').to.be.a('object');
        done();
      })
      .catch((error) => {
        expect.fail();
        done();
      });
  });
});

describe('identifierInUse', () => {
  it('should return a boolean inUse - true', (done) => {
    return UserInteractor.identifierInUse(driver, MOCK_OBJECTS.USERNAME)
      .then((val) => {
        expect(val.inUse, 'Expected isUse variable was not true').be.true;
        done();
      })
      .catch((error) => {
        expect.fail();
        done();
      });
  });
});