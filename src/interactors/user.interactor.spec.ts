import { UserInteractor, MailerInteractor, OTACodeInteractor  } from '../interactors/interactors';
import { BcryptDriver } from '../drivers/BcryptDriver';
import MongoDriver from '../drivers/MongoDriver';

const expect = require('chai').expect;
const driver = new MongoDriver; // DataStore 
const hasher = new BcryptDriver(3); // Hasher

beforeAll(done => {
  // Before running any tests, connect to database
  const dburi = process.env.CLARK_DB_URI_DEV.replace(
    /<DB_PASSWORD>/g,
    process.env.CLARK_DB_PWD
  )
  .replace(/<DB_PORT>/g, process.env.CLARK_DB_PORT)
  .replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME);
  driver.connect(dburi).then(val => {
    console.log('connected to database');
    done();
  }).catch((error) => {
    console.log('failed to connect to database');
    done();
  });
});

describe('searchUsers', () => {
    // Test 1: Provide expected input 
  it('should return an array of users', done => {
    const query = { username: 'nvisal1' };
    return UserInteractor.searchUsers(driver, query).then(val => {
      expect(val, 'users is not an array!').to.exist;
      done();
    }).catch((error) => {
      expect.fail();
      done();
    });
  });
   // Test 2: Provide empty dataStore and expect error message
  it('should return an error message', done => {
    const query = { username: 'nvisal1' };
    // Here we are passing an incorrect parameter for DataStore
    return UserInteractor.searchUsers(this.driver, query).then(val => {
      expect.fail();
      done();
    }).catch((error) => {
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
    const username = 'nvisal1';
    return UserInteractor.findUser(driver, username).then(val => {
      expect(val.username, 'Expected user was not returned!').to.equal('nvisal1'); 
      done();
    }).catch((error) => {
      expect.fail();
      done();
    });
  });
  it('should return an error message', done => {
    const username = 'nvisal1';
    // Here we are passing an incorrect parameter for DataStore
    return UserInteractor.findUser(this.driver, username).then(val => {
      expect.fail();
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
describe('verifyEmail', () => {
    // Test 1: Provide expected input 
  it('should return a user', done => {
    const email = 'nvisal1';
    return UserInteractor.verifyEmail(driver, email).then(val => {
      expect(val, 'Expected user was not returned!').to.be.a('object'); 
      done();
    }).catch((error) => {
      console.log(error);
      expect.fail();
      done();
    });
  });
}); 

// ** updatePassword **
// params (dataStore: DataStore, hasher: HashInterface, email: String, password: String)
// success - returns a user 
// failure - returns Promise.reject(`Problem updating password. Error:${e}`);
describe('updatePassword', () => {
    // Test 1: Provide expected input 
  it('should return a user', done => {
    const email = 'nvisal1';
    const password = '122595';
    return UserInteractor.updatePassword(driver, hasher, email, password).then(val => {
      expect(val, 'Expected user was not returned!').to.be.a('object'); 
      done();
    }).catch((error) => {
      console.log(error);
      expect.fail();
      done();
    });
  });
}); 

// ** identifierInUse **
// params (dataStore: DataStore, username: String)
// success - returns a user 
// failure - returns Promise.reject
describe('identifierInUse', () => {
    // Test 1: Provide expected input 
  it('should return a boolean inUse - true', done => {
    const username = 'nvisal1';
    return UserInteractor.identifierInUse(driver, username).then(val => {
      expect(val.inUse, 'Expected isUse variable was not true').be.true; 
      done();
    }).catch((error) => {
      expect.fail();
      done();
    });
  });
  it('should return a boolean inUse - false', done => {
    const username = '';
    return UserInteractor.identifierInUse(driver, username).then(val => {
      expect(val.inUse, 'Expected isUse variable was not true').be.false; 
      done();
    }).catch((error) => {
      expect.fail();
      done();
    });
  });
}); 

afterAll (() => {
  driver.disconnect();
  console.log('Disconnected from database');
});
