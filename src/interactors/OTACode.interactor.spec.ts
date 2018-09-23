import {
  UserInteractor,
  MailerInteractor,
  OTACodeInteractor
} from '../interactors/interactors';
import { ACCOUNT_ACTIONS } from '../interfaces/Mailer.defaults';
import LokiDriver from '../drivers/LokiDriver';
import { MOCK_OBJECTS } from '../../tests/mocks';
const expect = require('chai').expect;
const driver = new LokiDriver(); // DataStore

beforeAll(done => {
  driver.connect('test');
});

describe('generateOTACode', () => {
  it('should return an OTACode', done => {
    return OTACodeInteractor.generateOTACode(
      driver,
      ACCOUNT_ACTIONS.VERIFY_EMAIL,
      MOCK_OBJECTS.EMAIL
    )
      .then(val => {
        expect(val, 'Did not return OTACode').to.be.a('string');
        done();
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
  it('should return an error - empty email was given', done => {
    return OTACodeInteractor.generateOTACode(
      driver,
      ACCOUNT_ACTIONS.VERIFY_EMAIL,
      MOCK_OBJECTS.EMPTY_STRING
    )
      .then(val => {
        expect.fail();
        done();
      })
      .catch(error => {
        expect(error).to.be.a('string');
        done();
      });
  });
});

describe('decode', () => {
  it('should return decoded', done => {
    OTACodeInteractor.generateOTACode(
      driver,
      ACCOUNT_ACTIONS.VERIFY_EMAIL,
      MOCK_OBJECTS.EMAIL
    )
      .then(val => {
        return OTACodeInteractor.decode(driver, val).then(val => {
          expect(val, 'Did not return decoded').to.be.a('object');
          done();
        });
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
  it('should return an error - empty email was given!', done => {
    OTACodeInteractor.generateOTACode(
      driver,
      ACCOUNT_ACTIONS.VERIFY_EMAIL,
      MOCK_OBJECTS.EMPTY_STRING
    )
      .then(val => {
        return OTACodeInteractor.decode(driver, val).then(val => {
          expect.fail();
          done();
        });
      })
      .catch(error => {
        expect(error, 'Did not return decoded').to.be.a('string');
        done();
      });
  });
});

describe('applyOTACode', () => {
  it('should return decoded', done => {
    OTACodeInteractor.generateOTACode(
      driver,
      ACCOUNT_ACTIONS.VERIFY_EMAIL,
      MOCK_OBJECTS.EMAIL
    )
      .then(val => {
        return OTACodeInteractor.applyOTACode(driver, val)
          .then(val => {
            expect(val, 'Did not return decoded').to.be.a('object');
            done();
          })
          .catch(error => {
            expect.fail();
            done();
          });
      })
      .catch(error => {
        expect.fail();
        done();
      });
  });
});

afterAll(() => {
  driver.disconnect();
  console.log('Disconnected from database');
});
