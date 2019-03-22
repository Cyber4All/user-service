import { Assign, Edit, Remove } from '../collection-role/Interactor';
import MockDriver from '../drivers/MockDriver';
import { MOCK_OBJECTS } from '../tests/mocks';
const driver = new MockDriver();

describe('Assign.start', () => {
  it('should add the role of a user in a collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        MOCK_OBJECTS.USER,
        MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        MOCK_OBJECTS.ROLE
    )).resolves.toBe(undefined);
  });
});

describe('Edit.start', () => {
  it('should update the role of a user in a collection', async () => {
    expect.assertions(1);
    await expect(Edit.start(
        driver,
        MOCK_OBJECTS.USER,
        MOCK_OBJECTS.COLLECTION,
        MOCK_OBJECTS.USER_ID,
        MOCK_OBJECTS.ROLE
    )).resolves.toBe(undefined);
  });
});

describe('Remove.start', () => {
  it('should remove the role of a user in a collection', async () => {
    expect.assertions(1);
    await expect(Remove.start(
        driver,
        MOCK_OBJECTS.USER,
        MOCK_OBJECTS.COLLECTION,
        MOCK_OBJECTS.USER_ID,
        MOCK_OBJECTS.ROLE
    )).resolves.toBe(undefined);
  });
});
