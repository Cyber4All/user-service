import { AdminUserInteractor } from '../interactors/AdminUserInteractor';
import MockDriver from '../drivers/MockDriver';
import { MOCK_OBJECTS } from '../../tests/mocks';
import { expect } from 'chai';
const driver = new MockDriver(); // DataStore

describe('fetchUsers', () => {
  it('should return an array of users', done => {
    return AdminUserInteractor.fetchUsers(driver, MOCK_OBJECTS.USERNAME_QUERY)
      .then(val => {
        expect(val).to.be.an('object');
        done();
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
  it('password should be undefined on user object when returned!', done => {
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
  it('should return all users. empty query', done => {
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
