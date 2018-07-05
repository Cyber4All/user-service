import { AdminUserInteractor } from '../interactors/AdminUserInteractor';
import { BcryptDriver } from '../drivers/BcryptDriver';
import MongoDriver from '../drivers/MongoDriver';

const expect = require('chai').expect;
const dburi = process.env.CLARK_DB_URI_TEST;
const driver = new MongoDriver(dburi); // DataStore
const hasher = new BcryptDriver(3); // Hasher

beforeAll(done => {
  // Before running any tests, connect to database
  // const dburi = process.env.CLARK_DB_URI_DEV.replace(
  //   /<DB_PASSWORD>/g,
  //   process.env.CLARK_DB_PWD
  // )
  // .replace(/<DB_PORT>/g, process.env.CLARK_DB_PORT)
  // .replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME);
  driver
    .connect(dburi)
    .then(val => {
      console.log('connected to database');
      done();
    })
    .catch(error => {
      console.log('failed to connect to database');
      done();
    });
});

describe('fetchUsers', () => {
  it('should return an array of users', done => {
    const query = { username: 'nvisal1' };
    return AdminUserInteractor.fetchUsers(driver, query)
      .then(val => {
        expect(val, 'users is not an array!').to.be.a('object');
        done();
      })
      .catch(error => {
        console.log(error);
        expect.fail();
        done();
      });
  });
  it('should return a user - password should be undefined when returned!', done => {
    const query = { username: 'nvisal1' };
    return AdminUserInteractor.fetchUsers(driver, query)
      .then(val => {
        console.log(val.users[0]['_password']);
        expect(val.users[0]['_password'], 'user not returned!').to.be.undefined;
        done();
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
  it('should return all users - empty query', done => {
    const query = { username: '' };
    return AdminUserInteractor.fetchUsers(driver, query)
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

afterAll(() => {
  driver.disconnect();
  console.log('Disconnected from database');
});
