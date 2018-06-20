import { UserInteractor, MailerInteractor, OTACodeInteractor  } from '../interactors/interactors';
import { BcryptDriver } from '../drivers/BcryptDriver';
import MongoDriver from '../drivers/MongoDriver';

const expect = require('chai').expect;
const driver = new MongoDriver; // DataStore 
const hasher = new BcryptDriver(3); // Hasher

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

describe('searchUsers', () => {
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
  it('should return an array of users - password should be undefined when returned!', done => {
    const query = { username: 'nvisal1' };
    return UserInteractor.searchUsers(driver, query).then(val => {
      expect(val[0].password, 'users is not an array!').to.be.an('undefined');
      done();
    }).catch((error) => {
      expect.fail();
      done();
    });
  });
  it('should return an array of users - accessGroups should be gone when returned!', done => {
    const query = { username: 'nvisal1' };
    return UserInteractor.searchUsers(driver, query).then(val => {
      if (val[0].hasOwnProperty('accessGroups')) {
        expect.fail();
        done();
      }
      done();
    }).catch((error) => {
      expect.fail();
      done();
    });
  });
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

describe('findUser', () => {
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
  it('should return a user - password should be undefined when returned!', done => {
    const username = 'nvisal1';
    return UserInteractor.findUser(driver, username).then(val => {
      expect(val.password, 'user not returned!').to.be.an('undefined');
      done();
    }).catch((error) => {
      expect.fail();
      done();
    });
  });
  it('should return a user - accessGroups should be gone when returned!', done => {
    const username = 'nvisal1';
    return UserInteractor.findUser(driver, username).then(val => {
      if (val.hasOwnProperty('accessGroups')) {
        expect.fail();
        done();
      }
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

describe('verifyEmail', () => {
  it('should return a user', done => {
    const email = 'nvisal1@students.towson.edu';
    return UserInteractor.verifyEmail(driver, email).then(val => {
      expect(val, 'Expected user was not returned!').to.be.a('object'); 
      done();
    }).catch((error) => {
      expect.fail();
      done();
    });
  });
  it('should return a user - password should be undefined when returned!', done => {
    const email = 'nvisal1@students.towson.edu';
    return UserInteractor.verifyEmail(driver, email).then(val => {
      expect(val.user.password, 'user not returned!').to.be.an('undefined');
      done();
    }).catch((error) => {
      expect.fail();
      done();
    });
  });
  it('should return a user - with a token!', done => {
    const email = 'nvisal1@students.towson.edu';
    return UserInteractor.verifyEmail(driver, email).then(val => {
      if (!val.hasOwnProperty('token')) {
        expect.fail();
        done();
      }
      done();
    }).catch((error) => {
      expect.fail();
      done();
    });
  });
}); 

describe('updatePassword', () => {
  it('should return a user', done => {
    const email = 'nvisal1';
    const password = '122595';
    return UserInteractor.updatePassword(driver, hasher, email, password).then(val => {
      expect(val, 'Expected user was not returned!').to.be.a('object'); 
      done();
    }).catch((error) => {
      expect.fail();
      done();
    });
  });
  it('should return a user - password should be undefined when returned!', done => {
    const email = 'nvisal1';
    const password = '122595';
    return UserInteractor.updatePassword(driver, hasher, email, password).then(val => {
      expect(val.password, 'user not returned!').to.be.an('undefined');
      done();
    }).catch((error) => {
      expect.fail();
      done();
    });
  });
  it('should return a user - accessGroups should be gone when returned!', done => {
    const email = 'nvisal1';
    const password = '122595';
    return UserInteractor.updatePassword(driver, hasher, email, password).then(val => {
      if (val.hasOwnProperty('accessGroups')) {
        expect.fail();
        done();
      }
      done();
    }).catch((error) => {
      expect.fail();
      done();
    });
  });
}); 

describe('identifierInUse', () => {
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
