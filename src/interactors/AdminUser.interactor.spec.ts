import { AdminUserInteractor } from '../interactors/AdminUserInteractor';
import MockDriver from '../drivers/MockDriver';
import { MOCK_OBJECTS } from '../tests/mocks';
const driver = new MockDriver(); // DataStore

describe('fetchUsers', () => {
  it('should return an array of users', async () => {
    const results = await AdminUserInteractor.fetchUsers(driver, MOCK_OBJECTS.USERNAME_QUERY)
    expect(results.total).toBeGreaterThan(0)
    expect(results.users).toBeInstanceOf(Array);
  });

  it('password should be undefined on user object when returned', async () => {
    const result = await AdminUserInteractor.fetchUsers(driver, MOCK_OBJECTS.USERNAME_QUERY);
    expect(
      // @ts-ignore
      result.users.filter(user => typeof user.password !== 'undefined' && user.password !== '').length
    ).toBe(0);
  });

  it('should return all users. empty query', async () => {
    await expect(
      AdminUserInteractor.fetchUsers(driver, MOCK_OBJECTS.EMPTY_USERNAME_QUERY)
    ).resolves.toBeDefined();
  });
});
