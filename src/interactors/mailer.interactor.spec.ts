import { UserInteractor, MailerInteractor, OTACodeInteractor  } from '../interactors/interactors';
import {
    DataStore,
    Mailer,
    Responder,
    HashInterface
  } from '../interfaces/interfaces';
import BcryptDriver from '../drivers/BcryptDriver';
import MongoDriver from '../drivers/MongoDriver';
import RouteResponder  from '../drivers/RouteResponder';

const expect = require('chai').expect;
const driver = new MongoDriver; // DataStore 
const hasher = new BcryptDriver(3); // Hasher
const responder = new RouteResponder; // Responder
const dburi = process.env.CLARK_DB_URI_DEV.replace(
    /<DB_PASSWORD>/g,
    process.env.CLARK_DB_PWD
  )
  .replace(/<DB_PORT>/g, process.env.CLARK_DB_PORT)
  .replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME);
 // jest.setTimeout(10000);

// ** searchBasicEmail **
// params (dataStore: DataStore, query: UserQuery)
//   username?: string;
//   name?: string;
//   email?: string;
//   organization?: string;
// success - returns an array of users 
// failure - returns Promise.reject(`Problem searching users. Error: ${e}`);
describe('sendBasicEmail', () => {
    // Test 1: Provide expected input 
  it('should return an array of users', done => {
    driver.connect(dburi).then(val => {
      const query = { username: 'nvisal1' };
      return UserInteractor.sendBasicEmail(driver, query).then(val => {
        console.log('searchUsers test 1 was successful!');
        expect(val, 'users is not an array!').to.exist;
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
   // Test 2: Provide empty dataStore and expect error message
  it('should return an error message', done => {
    const query = { username: 'nvisal1' };
    // Here we are passing an incorrect parameter for DataStore
    return UserInteractor.searchUsers(this.driver, query).then(val => {
      console.log('searchUsers test 2 was unsuccessful');
      console.log(val);
      expect.fail();
      done();
    }).catch((error) => {
      console.log('searchUsers test 2 was successful!');
      expect(error, 'Expected error!').to.be.a('string');
      done();
    });
  });
});