import {
  login,
  register,
  passwordMatch,
  isValidUsername
} from './AuthenticationInteractor';
import { BcryptDriver } from '../drivers/BcryptDriver';
import LokiDriver from '../drivers/LokiDriver';
import { MOCK_OBJECTS } from '../../tests/mocks';
const driver = new LokiDriver(); // DataStore
const hasher = new BcryptDriver(3); // Hasher
const expect = require('chai').expect;

beforeAll(done => {
  driver.connect('test');
});

describe('AuthenticationInteractor', () => {
  describe('#login', () => {
    it('should pass for correct username and password', done => {
      login(driver, hasher, MOCK_OBJECTS.USERNAME, MOCK_OBJECTS.PASSWORD)
        .then(val => {
          expect(val).to.be.a('object');
          done();
        })
        .catch(error => {
          expect.fail();
          done();
        });
    });
    it('should return a user - should come with a token!', done => {
      login(driver, hasher, MOCK_OBJECTS.USERNAME, MOCK_OBJECTS.PASSWORD)
        .then(val => {
          if (!val.hasOwnProperty('token')) {
            expect.fail();
            done();
          }
          done();
        })
        .catch(error => {
          expect.fail();
          done();
        });
    });
    it('should fail for incorrect password', done => {
      login(driver, hasher, MOCK_OBJECTS.USERNAME, MOCK_OBJECTS.EMPTY_STRING)
        .then(val => {
          expect.fail();
          done();
        })
        .catch(error => {
          expect(error).to.be.a('object');
          done();
        });
    });
    it('should fail for incorrect user', done => {
      login(driver, hasher, MOCK_OBJECTS.EMPTY_STRING, MOCK_OBJECTS.PASSWORD)
        .then(val => {
          expect.fail();
          done();
        })
        .catch(error => {
          expect(error).to.be.a('object');
          done();
        });
    });
    it('should fail for empty input', done => {
      login(driver, hasher, MOCK_OBJECTS.EMPTY_STRING, MOCK_OBJECTS.EMPTY_STRING)
        .then(val => {
          expect.fail();
          done();
        })
        .catch(error => {
          expect(error).to.be.a('object');
          done();
        });
    });
  });
});

// Commented out so that we don't add new user for every test ran
describe('AuthenticationInteractor', () => {
  describe('#register', () => {
    // it('should pass for new user object', done => {
    //   login(driver, hasher, MOCK_OBJECTS.USERNAME, MOCK_OBJECTS.PASSWORD).then(val => {
    //     val['user'].username = 'UnitTester';
    //     return register(driver, hasher, val['user']).then(val => {
    //       console.log(val);
    //       expect(val).to.be.a('object');
    //       done();
    //     }).catch ((error) => {
    //       console.log(error);
    //       expect.fail();
    //       done();
    //     });
    //   }).catch ((error) => {
    //     expect.fail();
    //     done();
    //   });
    // });
    // it('should return a user - should come with a token!', done => {
    //   login(driver, hasher, MOCK_OBJECTS.USERNAME, MOCK_OBJECTS.PASSWORD).then(val => {
    //     val['user'].username = 'UnitTester';
    //     return register(driver, hasher, val['user']).then(val => {
    //       if (!val.hasOwnProperty('token')) {
    //         expect.fail();
    //         done();
    //       }
    //       done();
    //     }).catch ((error) => {
    //       expect.fail();
    //       done();
    //     });
    //   }).catch ((error) => {
    //     expect.fail();
    //     done();
    //   });
    // });
    it('should fail for existing username', done => {
      login(driver, hasher, MOCK_OBJECTS.USERNAME, MOCK_OBJECTS.PASSWORD)
        .then(val => {
          return register(driver, hasher, val['user'])
            .then(val => {
              expect.fail();
              done();
            })
            .catch(error => {
              expect(val).to.be.a('object');
              done();
            });
        })
        .catch(error => {
          expect.fail();
          done();
        });
    });
    it('should fail for existing email', done => {
      login(driver, hasher, MOCK_OBJECTS.USERNAME, MOCK_OBJECTS.PASSWORD)
        .then(val => {
          val['user'].username = 'UnitTester';
          val['user'].email = 'nvisal1@students.towson.edu';
          return register(driver, hasher, val['user'])
            .then(val => {
              expect.fail();
              done();
            })
            .catch(error => {
              expect(val).to.be.a('object');
              done();
            });
        })
        .catch(error => {
          expect.fail();
          done();
        });
    });
  });
});

describe('AuthenticationInteractor', () => {
  describe('#passwordMatch', () => {
    it('should pass for correct db, username, and password', done => {
      passwordMatch(driver, hasher, MOCK_OBJECTS.USERNAME, MOCK_OBJECTS.PASSWORD)
        .then(val => {
          expect(val).to.be.true;
          done();
        })
        .catch(error => {
          expect.fail();
          done();
        });
    });
    it('should fail for incorrect username', done => {
      passwordMatch(driver, hasher, MOCK_OBJECTS.EMPTY_STRING, MOCK_OBJECTS.PASSWORD)
        .then(val => {
          expect.fail();
          done();
        })
        .catch(error => {
          expect(error).to.be.a('string');
          done();
        });
    });
    it('should fail for incorrect password', done => {
      passwordMatch(driver, hasher, MOCK_OBJECTS.USERNAME, MOCK_OBJECTS.EMPTY_STRING)
        .then(val => {
          expect(val).to.be.false;
          done();
        })
        .catch(error => {
          expect.fail();
          done();
        });
    });
  });
});

describe('AuthenticationInteractor', () => {
  describe('#isValidUsername', () => {
    it('should fail for usernames longer than 20 characters', () => {
      expect(isValidUsername(MOCK_OBJECTS.LONG_USERNAME)).to.be.false;
    });
    it('should fail for usernames shorter than 3 characters', () => {
      expect(isValidUsername(MOCK_OBJECTS.SHORT_USERNAME)).to.be.false;
    });
    it('should pass for usernames shorter than 20 characters', () => {
      expect(isValidUsername(MOCK_OBJECTS.VALID_LONG_USERNAME)).to.be.true;
    });
    it('should pass for usernames with exactly 3 characters', () => {
      expect(isValidUsername(MOCK_OBJECTS.VALID_SHORT_USERNAME)).to.be.true;
    });
    it('should pass for usernames with exactly 20 characters', () => {
      expect(isValidUsername(MOCK_OBJECTS.VALID_MAX_LENGTH_USERNAME)).to.be.true;
    });
  });
});

afterAll(() => {
  driver.disconnect();
  console.log('Disconnected from database');
});
