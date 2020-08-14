import { UserInteractor } from '../interactors/interactors';
import { BcryptDriver } from '../drivers/BcryptDriver';
import MockDriver from '../drivers/MockDriver';
import { MOCK_OBJECTS } from '../tests/mocks';
import { COLLECTION_ROLE_MOCK_OBJECTS } from '../collection-role/MocksObjects';

const driver = new MockDriver(); // DataStore
const hasher = new BcryptDriver(10); // Hasher

describe('searchUsers', () => {
  it('should return an array of users', async ()=> {
    await expect(
      UserInteractor.searchUsers(driver, MOCK_OBJECTS.USERNAME_QUERY)
    ).resolves.toBeInstanceOf(Array)
  });
});

describe('findUser', () => {
  it('should return a user ID', async ()=> {
    expect(
      typeof (await UserInteractor.findUser(driver, MOCK_OBJECTS.USERNAME))
    ).toBe('string');
  });

  it('should return an error message', async () => {
    // Here we are passing an incorrect parameter for DataStore
    await expect(
      UserInteractor.findUser(this.driver, MOCK_OBJECTS.USERNAME)
    ).rejects.toBeDefined();
  });
});

describe('updatePassword', () => {
  it('should return a user', async () => {
    await expect(
      UserInteractor.updatePassword(driver, hasher, MOCK_OBJECTS.EMAIL, MOCK_OBJECTS.PASSWORD)
    ).resolves.toBeInstanceOf(Object);
  });
});

describe('Finds all curators for a specified collection', () => {
  it('return curators', async () => {
    await expect(
      UserInteractor.fetchCurators(driver,COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP)
    ).resolves.toBeInstanceOf(Object);
  });
});

describe('identifierInUse', () => {
  it('should return a boolean inUse - true', async ()=> {
    await expect(
      UserInteractor.identifierInUse(driver, MOCK_OBJECTS.USERNAME)
    ).resolves.toBeTruthy();
  });
});