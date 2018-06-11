import { UserInteractor, MailerInteractor, OTACodeInteractor  } from '../interactors/interactors';
import {
    DataStore,
    Mailer,
    HashInterface
  } from '../interfaces/interfaces';
import MongoDriver from '../drivers/MongoDriver';

const expect = require('chai').expect;
const driver = new MongoDriver;
const dburi = process.env.CLARK_DB_URI_DEV.replace(
    /<DB_PASSWORD>/g,
    process.env.CLARK_DB_PWD
  )
  .replace(/<DB_PORT>/g, process.env.CLARK_DB_PORT)
  .replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME);


// ** searchUsers **
// params (dataStore: DataStore, query: UserQuery)
//   username?: string;
//   name?: string;
//   email?: string;
//   organization?: string;
// success - returns an array of users 
// failure - returns Promise.reject(`Problem searching users. Error: ${e}`);
describe('UserInteractor', () => {
    // Test 1: Provide expected input 
  it('should return an array of users', done => {
    driver.connect(dburi).then(val => {
      const query = { username: 'nvisal1' };
      console.log(typeof(driver));
      return UserInteractor.searchUsers(driver, query).then(val => {
        expect(val, 'users is not an array!').to.be.null; 
        done;
      }).catch((error) => {
        console.log(error);
      });
    }).catch((error) => {
      console.log(error);
    });
});
  
//     // Test 2: Provide empty input 
//   it('should return an array of all users', function() {
//     const query = {};
//     user.searchUsers(this.dataStore, query).then(val => {
//       expect(val, 'array does not contain all users!').to.be.false; 
//     }).catch((error) => {
//       console.log(error);
//     });
//   });
//     // Test 3: Provide unexpected input 
//   it('should return an empty array', function() {
//     const query = { username: 'fdjkaldkfjh' };
//     user.searchUsers(this.dataStore, query).then(val => {
//       expect(val, 'array is not empty!').to.be.false; 
//     }).catch((error) => {
//       console.log(error);
//     });
//   });
});

// ** findUser **
// params (dataStore: DataStore, query: UserQuery)
//   username?: string;
//   name?: string;
//   email?: string;
//   organization?: string;
// success - returns an array of users 
// failure - returns Promise.reject(`Problem searching users. Error: ${e}`);
// describe('UserInteractor - findUser', () => {
//     // Test 1: Provide expected input 
//   it('should return a user', function() {
//     const username = 'nvisal1';
//     UserInteractor.findUser(this.dataStore, username).then(val => {
//       expect(val, 'users is not an array!').to.be.undefined; 
//     });
//    });
//     // Test 2: Provide empty input 
//   it('should return an array of all users', function() {
//     const query = {};
//     UserInteractor.findUser(this.dataStore, query).then(val => {
//       expect(val, 'array does not contain all users!').to.be.false; 
//     });
//   });
//     // Test 3: Provide unexpected input 
//   it('should return an empty array', function() {
//     const username = 'fdjkaldkfjh';
//     UserInteractor.findUser(this.dataStore, username).then(val => {
//       expect(val, 'array is not empty!').to.be.false; 
//     });
//   });
// });
