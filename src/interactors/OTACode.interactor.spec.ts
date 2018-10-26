import {
  UserInteractor,
  MailerInteractor,
  OTACodeInteractor
} from '../interactors/interactors';
import { ACCOUNT_ACTIONS } from '../interfaces/Mailer.defaults';
import MockDriver from '../drivers/MockDriver';
import { MOCK_OBJECTS } from '../tests/mocks';
const expect = require('chai').expect;
const driver = new MockDriver(); // DataStore

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
});


