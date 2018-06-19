import { login, register, passwordMatch, isValidUsername } 
from './AuthenticationInteractor';
import { BcryptDriver } from '../drivers/BcryptDriver';
import MongoDriver from '../drivers/MongoDriver';
const driver = new MongoDriver; // DataStore 
const hasher = new BcryptDriver(3); // Hasher
const expect = require('chai').expect;

beforeAll(done => {
  // Before running any tests, connect to database
  const dburi = process.env.CLARK_DB_URI_TEST;
  // const dburi = process.env.CLARK_DB_URI_DEV.replace(
  //   /<DB_PASSWORD>/g,
  //   process.env.CLARK_DB_PWD
  // )
  // .replace(/<DB_PORT>/g, process.env.CLARK_DB_PORT)
  // .replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME);
  driver.connect(dburi).then(val => {
    console.log('connected to database');
    done();
  }).catch((error) => {
    console.log('failed to connect to database');
    done();
  });
});

describe('AuthenticationInteractor', () => {
  describe('#login', () => {
    it('should pass for correct username and password', done => {
      const username  = 'nvisal1'; 
      const password  = '122595';
      login(driver, hasher, username, password).then(val => {
        expect(val).to.be.a('object');
        done();
      }).catch ((error) => {
        expect.fail();
        done();
      });
    });
    it('should fail for incorrect password', done => {
      const username  = 'nvisal1'; 
      const password  = '';
      login(driver, hasher, username, password).then(val => {
        expect.fail();
        done();
      }).catch ((error) => {
        expect(error).to.be.a('object');
        done();
      });
    });
    it('should fail for incorrect user', done => {
      const username  = ''; 
      const password  = '122595';
      login(driver, hasher, username, password).then(val => {
        expect.fail();
        done();
      }).catch ((error) => {
        expect(error).to.be.a('object');
        done();
      });
    });
    it('should fail for empty input', done => {
      const username  = ''; 
      const password  = '';
      login(driver, hasher, username, password).then(val => {
        expect.fail();
        done();
      }).catch ((error) => {
        expect(error).to.be.a('object');
        done();
      });
    });
  });
});

// Commented out so that we don't add new user for every test ran
// describe('AuthenticationInteractor', () => {
//   describe('#register', () => {
//     it('should pass for new user object', done => {
//       const user = {
//         username: 'n',
//         name: 'n',
//         email: 'n',
//         organization: 'n',
//         password: 'n'
//       };
//       register(driver, hasher, user).then(val => {
//         console.log(val);
//         expect(val).to.be.a('object');
//         done();
//       }).catch ((error) => {
//         console.log(error);
//         expect.fail();
//         done();
//       });
//     });
//     it('should fail for existing username', done => {
//       const user = {
//         _username: 'n',
//         _name: 'n',
//         _email: 'n',
//         _organization: 'n',
//         _password: 'n'
//       };
//       register(driver, hasher, user).then(val => {
//         console.log(val);
//         expect.fail();
//         done();
//       }).catch ((error) => {
//         console.log(error);
//         expect(error).to.be.a('object');
//         done();
//       });
//     });
//     it('should fail for existing email', done => {
//       const user = {
//         _username: 'n',
//         _name: 'n',
//         _email: 'n',
//         _organization: 'n',
//         _password: 'n'
//       };
//       register(driver, hasher, user).then(val => {
//         console.log(val);
//         expect.fail();
//         done();
//       }).catch ((error) => {
//         console.log(error);
//         expect(error).to.be.a('object');
//         done();
//       });
//     });
//   });
// });

describe('AuthenticationInteractor', () => {
  describe('#passwordMatch', () => {
    it('should pass for correct db, username, and password', done => {
      const username  = 'nvisal1'; 
      const password  = '122595';
      passwordMatch(driver, hasher, username, password).then(val => {
        expect(val).to.be.true;
        done();
      }).catch ((error) => {
        expect.fail();
        done();
      });
    });
    it('should fail for incorrect username', done => {
      const username  = ''; 
      const password  = '122595';
      passwordMatch(driver, hasher, username, password).then(val => {
        expect.fail();
        done();
      }).catch ((error) => {
        expect(error).to.be.a('string');
        done();
      });
    });
    it('should fail for incorrect password', done => {
      const username  = 'nvisal1'; 
      const password  = '';
      passwordMatch(driver, hasher, username, password).then(val => {
        expect(val).to.be.false;
        done();
      }).catch ((error) => {
        expect.fail();
        done();
      });
    });
  });
});

describe('AuthenticationInteractor', () => {
  describe('#isValidUsername', () => {
    it('should fail for usernames longer than 20 characters', () => {
      expect(isValidUsername('abcdefghijklmnopqrstuvwxyz')).to.be.false;
    });
    it('should fail for usernames shorter than 3 characters', () => {
      expect(isValidUsername('12')).to.be.false;
    });
    it('should pass for usernames shorter than 20 characters', () => {
      expect(isValidUsername('myshortusername')).to.be.true;
    });
    it('should pass for usernames with exactly 3 characters', () => {
      expect(isValidUsername('123')).to.be.true;
    });
    it('should pass for usernames with exactly 20 characters', () => {
      expect(isValidUsername('aaaaaaaaaaaaaaaaaaaa')).to.be.true;
    });
  });
});

afterAll (() => {
  driver.disconnect();
  console.log('Disconnected from database');
});

