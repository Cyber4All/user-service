import { Assign, Edit, Remove } from '../collection-role/Interactor';
import MockDriver from '../drivers/MockDriver';
import { COLLECTION_ROLE_MOCK_OBJECTS } from './MocksObjects';
import { MOCK_OBJECTS } from '../tests/mocks';
import { ResourceError } from '../Error';
const driver = new MockDriver();

describe('Assign.start', () => {
  it('allows an admin assign a curator role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR,
    )).resolves.toBe(undefined);
  });
  it('allows an admin assign a reviewer role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).resolves.toBe(undefined);
  });
  it('allows an admin assign a curator role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_SECJ,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR,
    )).resolves.toBe(undefined);
  });
  it('allows an admin assign a reviewer role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_SECJ,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).resolves.toBe(undefined);
  });
  it('allows an admin cannot assign curator role to a user who is already a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents an admin from assigning a reviewer role to a user who is already a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('allows a curator to assign a reviewer role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_C5,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).resolves.toBe(undefined);
  });
  it('prevents a curator from assigning a curator role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_C5,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a curator role to a user who is already a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a reviewer role to a user who is already a member of the collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a curator role to a user who is not a member of a different collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a reviewer role to a user who is not a member of a different collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a curator role to a user who is a member of a different collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_C5,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR,
    )).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a reviewer role to a user who is a member of a different collection', async () => {
    expect.assertions(1);
    await expect(Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_C5,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER,
    )).rejects.toBeInstanceOf(ResourceError);
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
