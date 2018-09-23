import { AdminUserInteractor } from '../interactors/AdminUserInteractor';
import { BcryptDriver } from '../drivers/BcryptDriver';
import LokiDriver from '../drivers/LokiDriver';
import { MOCK_OBJECTS } from '../../tests/mocks';

// const expect = require('chai').expect;
const driver = new LokiDriver(); // DataStore

beforeAll(done => {
  // String arg is defined in datastore interface but not used in lokidriver.
  driver.connect('test');

});

describe('fetchUsers', () => {
  it('should return an array of users', done => {
    return AdminUserInteractor.fetchUsers(driver, MOCK_OBJECTS.USERNAME_QUERY)
      .then(val => {
        expect(val).toBeDefined();
        done();
        console.log(val);
      });
  });
  it('should return a user - password should be undefined when returned!', done => {
    return AdminUserInteractor.fetchUsers(driver, MOCK_OBJECTS.USERNAME_QUERY)
      .then(val => {
        expect(val.users[0]['_password'], 'user not returned!').to.be.undefined;
        done();
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
  it('should return all users - empty query', done => {
    return AdminUserInteractor.fetchUsers(driver, MOCK_OBJECTS.EMPTY_USERNAME_QUERY)
      .then(val => {
        expect(val, 'users is not an array!').to.be.a('object');
        done();
      })
      .catch(error => {
        expect.fail();
        console.log(error);
        done();
      });
  });
});

// describe('deleteUser', () => {
//   it('Should delete a user', done => {
//     const userId = '12345';
//     AdminUserInteractor.deleteUser(driver, userId)
//     .then(val => {
//       expect(val).to.be.an.undefined;
//       done();
//     })
//     .catch(error => {
//       expect.fail();
//       console.log(error);
//       done();
//     });
//   });
// });

afterAll(() => {
  // driver.disconnect();
  console.log('Disconnected from database');
});
