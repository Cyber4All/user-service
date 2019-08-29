import { OTACodeInteractor } from '../interactors/interactors';
import { ACCOUNT_ACTIONS } from '../interfaces/Mailer.defaults';
import MockDriver from '../drivers/MockDriver';
import { MOCK_OBJECTS } from '../tests/mocks';
const driver = new MockDriver(); // DataStore

describe('generateOTACode', () => {
  it('should return an OTACode', async () => {
    // set required environment variable
    process.env.OTA_CODE_SECRET = 'dont tell anybody, im a secret';
    process.env.OTA_CODE_ISSUER = 'i am the issuer',

    await expect(
      OTACodeInteractor.generateOTACode(
        driver,
        ACCOUNT_ACTIONS.VERIFY_EMAIL,
        MOCK_OBJECTS.EMAIL
      )
    ).resolves.toBeDefined();
  });
});
