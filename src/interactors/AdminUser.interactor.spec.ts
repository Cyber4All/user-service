import { AdminUserInteractor } from '../interactors/AdminUserInteractor';
import {
    DataStore,
    Mailer,
    Responder,
    HashInterface
  } from '../interfaces/interfaces';
import MongoDriver from '../drivers/MongoDriver';
import RouteResponder  from '../drivers/RouteResponder';

const expect = require('chai').expect;
const driver = new MongoDriver; // DataStore 
const dburi = process.env.CLARK_DB_URI_DEV.replace(
    /<DB_PASSWORD>/g,
    process.env.CLARK_DB_PWD
  )
  .replace(/<DB_PORT>/g, process.env.CLARK_DB_PORT)
  .replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME);
 // jest.setTimeout(10000);

// ** fetchUsers **
// params (dataStore: DataStore, query: UserQuery)
//   username?: string;
//   name?: string;
//   email?: string;
//   organization?: string;
// success - returns an array of all users 
// failure - returns Promise.reject(`Problem fetching users. Error: ${e}`);
describe('fetchUsers', () => {
    // Test 1: Provide expected input 
  it('should return an array of users', done => {
    driver.connect(dburi).then(val => {
      const query = { username: 'nvisal1' };
      return AdminUserInteractor.fetchUsers(driver, query).then(val => {
        expect(val, 'users is not an array!').to.be.a('object'); 
        done();
      }).catch((error) => {
        console.log(error);
        expect.fail();
        done();
      });
    }).catch((error) => {
      console.log(error);
      expect.fail();
      done();
    });
  });
  it('should return al users - empty query', done => {
    driver.connect(dburi).then(val => {
      const query = { username: '' };
      return AdminUserInteractor.fetchUsers(driver, query).then(val => {
        expect(val, 'users is not an array!').to.be.a('object');
        expect.fail();
        done();
      }).catch((error) => {
        expect.fail();
        console.log(error);
        done();
      });
    }).catch((error) => {
      console.log(error);
      expect.fail();
      done();
    });
  });
}); 
