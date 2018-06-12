import { UserInteractor, MailerInteractor, OTACodeInteractor  } from '../interactors/interactors';
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
const responder = new RouteResponder; // Responder
const dburi = process.env.CLARK_DB_URI_DEV.replace(
    /<DB_PASSWORD>/g,
    process.env.CLARK_DB_PWD
  )
  .replace(/<DB_PORT>/g, process.env.CLARK_DB_PORT)
  .replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME);
 // jest.setTimeout(10000);

// ** searchUsers **
// params (dataStore: DataStore, query: UserQuery)
//   username?: string;
//   name?: string;
//   email?: string;
//   organization?: string;
// success - returns an array of users 
// failure - returns Promise.reject(`Problem searching users. Error: ${e}`);
describe('searchUsers', () => {
    // Test 1: Provide expected input 
  it('should return an array of users', done => {
    driver.connect(dburi).then(val => {
      const query = { username: 'nvisal1' };
      return UserInteractor.searchUsers(driver, query).then(val => {
        expect(val, 'users is not an array!').to.exist; 
        done();
      }).catch((error) => {
        console.log(error);
        done();
      });
    }).catch((error) => {
      console.log(error);
      done();
    });
  });
   // Test 2: Provide empty dataStore and expect error message
  it('should return an error message', done => {
    const query = { username: 'nvisal1' };
    // Here we are passing an incorrect parameter for DataStore
    return UserInteractor.searchUsers(driver, query).then(val => {
      done();
    }).catch((error) => {
      console.log(error);
      expect(error, 'Expected error!').to.be.a('string');
      done();
    });
  });
});

// ** findUser **
// params (dataStore: DataStore, username: String)
// success - returns a user 
// failure - returns Promise.reject(`Problem finding specified user. Error: ${error}`);
describe('findUser', () => {
    // Test 1: Provide expected input 
  it('should return a user', done => {
    driver.connect(dburi).then(val => {
      const username = 'nvisal1';
      return UserInteractor.findUser(driver, username).then(val => {
        expect(val, 'Expected user was not returned!').to.include('nvisal1'); 
        this.driver.disconnect();
        done();
      }).catch((error) => {
        console.log(error);
        done();
      });
    }).catch((error) => {
      console.log(error);
      done();
    });
  });
  it('should return an error message', done => {
    const username = 'nvisal1';
    // Here we are passing an incorrect parameter for DataStore
    return UserInteractor.findUser(driver, username).then(val => {
      console.log(val);
      done();
    }).catch((error) => {
      expect(error, 'Expected user was not returned!').to.be.a('string');
      done();
    });
  });
});

// ** verifyEmail **
// params (dataStore: DataStore, responder: Responder, email: String)
// success - returns a user 
// failure - returns Promise.reject(`Problem verifying email. Error: ${e}`);
// describe('verifyEmail', () => {
//     // Test 1: Provide expected input 
//   it('should return a user', done => {
//     driver.connect(dburi).then(val => {
//       const email = 'nvisal1';
//       return UserInteractor.verifyEmail(driver, responder, email).then(val => {
//         expect(val, 'Expected user was not returned!').to.include('nvisal1'); 
//         this.driver.disconnect();
//         done();
//       }).catch((error) => {
//         console.log(error);
//         done();
//       });
//     }).catch((error) => {
//       console.log(error);
//       done();
//     });
//   });
// }); 

// // ** updatePassword **
// // params (dataStore: DataStore, hasher: HashInterface, email: String, password: String)
// // success - returns a user 
// // failure - returns Promise.reject(`Problem updating password. Error:${e}`);
// describe('updatePassword', () => {
//     // Test 1: Provide expected input 
//   it('should return a user', done => {
//     driver.connect(dburi).then(val => {
//       const email = 'nvisal1';
//       const password = '';
//       return UserInteractor.updatePassword(driver, hasher, email, password).then(val => {
//         expect(val, 'Expected user was not returned!').to.include('nvisal1'); 
//         this.driver.disconnect();
//         done();
//       }).catch((error) => {
//         console.log(error);
//         done();
//       });
//     }).catch((error) => {
//       console.log(error);
//       done();
//     });
//   });
// }); 

// ** identifierInUse **
// params (dataStore: DataStore, username: String)
// success - returns a user 
// failure - returns Promise.reject
describe('identifierInUse', () => {
    // Test 1: Provide expected input 
  it('should return a boolean inUse', done => {
    driver.connect(dburi).then(val => {
      const username = 'nvisal1';
      return UserInteractor.identifierInUse(driver, username).then(val => {
        expect(val.inUse, 'Expected isUse variable was not true').be.true; 
        driver.disconnect();
        done();
      }).catch((error) => {
        console.log(error);
        done();
      });
    }).catch((error) => {
      console.log(error);
      done();
    });
  });
}); 
