import { UserInteractor, MailerInteractor, OTACodeInteractor  } from '../interactors/interactors';
import MongoDriver from '../drivers/MongoDriver';
import { ACCOUNT_ACTIONS } from '../interfaces/Mailer.defaults';
const expect = require('chai').expect;
const driver = new MongoDriver; // DataStore 

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

describe('generateOTACode', () => {
    // Test 1: Provide expected input 
  it('should return an OTACode', done => {
    const email = 'nvisal1@students.towson.edu';
    return OTACodeInteractor.generateOTACode
      (driver, ACCOUNT_ACTIONS.VERIFY_EMAIL, email).then(val => {
        expect(val, 'Did not return OTACode').to.be.a('string'); 
        done();
      }).catch((error) => {
        expect.fail();
        done();
      });
  });
    // Test 2: Provide unexpected input 
  it('should return an error - empty email was given', done => {
    const email = '';
    return OTACodeInteractor.generateOTACode
          (driver, ACCOUNT_ACTIONS.VERIFY_EMAIL, email).then(val => {
            expect.fail(); 
            done();
          }).catch((error) => {
            expect(error).to.be.a('string');
            done();
          });
  });
});

describe('decode', () => {
  it('should return decoded', done => {
    const email = 'nvisal1@students.towson.edu';
    OTACodeInteractor.generateOTACode(driver, ACCOUNT_ACTIONS.VERIFY_EMAIL, email).then(val => {
      return OTACodeInteractor.decode(driver, val).then(val => {
        expect(val, 'Did not return decoded').to.be.a('object'); 
        done();
      });
    }).catch((error) => {
      expect.fail();
      done();
    });
  });
  it('should return an error - empty email was given!', done => {
    const email = '';
    OTACodeInteractor.generateOTACode(driver, ACCOUNT_ACTIONS.VERIFY_EMAIL, email).then(val => {
      return OTACodeInteractor.decode(driver, val).then(val => {
        expect.fail();
        done();
      });
    }).catch((error) => {
      expect(error, 'Did not return decoded').to.be.a('string'); 
      done();
    });
  });
});

describe('applyOTACode', () => {
  it('should return decoded', done => {
    const email = 'nvisal1@students.towson.edu';
    OTACodeInteractor.generateOTACode(driver, ACCOUNT_ACTIONS.VERIFY_EMAIL, email).then(val => {
      return OTACodeInteractor.applyOTACode(driver, val).then(val => {
        expect(val, 'Did not return decoded').to.be.a('object'); 
        done();
      }).catch((error) => {
        expect.fail();
        done();
      });
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


