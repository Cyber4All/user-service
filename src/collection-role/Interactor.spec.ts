import {
  Assign,
  Edit,
  removeRole,
  fetchReviewers,
  fetchCurators,
  fetchMembers
} from '../collection-role/Interactor';
import MockDriver from '../drivers/MockDriver';
import { COLLECTION_ROLE_MOCK_OBJECTS } from './MocksObjects';
import { MOCK_OBJECTS } from '../tests/mocks';
import { ResourceError } from '../Error';
const driver = new MockDriver();

describe('Assign.start', () => {
  it('allows an admin assign a curator role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(
      Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR
      )
    ).resolves.toBe(undefined);
  });
  it('allows an admin assign a reviewer role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(
      Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER
      )
    ).resolves.toBe(undefined);
  });
  it('allows an admin assign a curator role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(
      Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_SECJ,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR
      )
    ).resolves.toBe(undefined);
  });
  it('allows an admin assign a reviewer role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(
      Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_SECJ,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER
      )
    ).resolves.toBe(undefined);
  });
  it('allows an admin cannot assign curator role to a user who is already a member of the collection', async () => {
    expect.assertions(1);
    await expect(
      Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR
      )
    ).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents an admin from assigning a reviewer role to a user who is already a member of the collection', async () => {
    expect.assertions(1);
    await expect(
      Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER
      )
    ).rejects.toBeInstanceOf(ResourceError);
  });
  it('allows a curator to assign a reviewer role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(
      Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_C5,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER
      )
    ).resolves.toBe(undefined);
  });
  it('prevents a curator from assigning a curator role to a user who is not a member of the collection', async () => {
    expect.assertions(1);
    await expect(
      Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_C5,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR
      )
    ).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a curator role to a user who is already a member of the collection', async () => {
    expect.assertions(1);
    await expect(
      Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR
      )
    ).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a reviewer role to a user who is already a member of the collection', async () => {
    expect.assertions(1);
    await expect(
      Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER
      )
    ).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a curator role to a user who is not a member of a different collection', async () => {
    expect.assertions(1);
    await expect(
      Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR
      )
    ).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a reviewer role to a user who is not a member of a different collection', async () => {
    expect.assertions(1);
    await expect(
      Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER
      )
    ).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a curator role to a user who is a member of a different collection', async () => {
    expect.assertions(1);
    await expect(
      Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_C5,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_CURATOR
      )
    ).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from assigning a reviewer role to a user who is a member of a different collection', async () => {
    expect.assertions(1);
    await expect(
      Assign.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_C5,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER
      )
    ).rejects.toBeInstanceOf(ResourceError);
  });
});

describe('Edit.start', () => {
  it('allows an admin to give a curator reviewer access within the same collection', async () => {
    expect.assertions(1);
    await expect(
      Edit.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER
      )
    ).resolves.toBe(undefined);
  });
  it('prevents an admin from giving a curator reviewer access for a different collection', async () => {
    expect.assertions(1);
    await expect(
      Edit.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER
      )
    ).rejects.toBeInstanceOf(ResourceError);
  });
  it('curator - can give a curator reviewer access within the same collection', async () => {
    expect.assertions(1);
    await expect(
      Edit.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER
      )
    ).resolves.toBe(undefined);
  });
  it('curator - cannot give a curator reviewer access for a different collection', async () => {
    expect.assertions(1);
    await expect(
      Edit.start(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        MOCK_OBJECTS.USER_ID,
        COLLECTION_ROLE_MOCK_OBJECTS.ROLE_REVIEWER
      )
    ).rejects.toBeInstanceOf(ResourceError);
  });
});

describe('removeRole', () => {
  it('allows an admin to remove a curator role from a user', async () => {
    expect.assertions(1);
    await expect(
      removeRole({
        dataStore: driver,
        requester: COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        collection: COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        userId: MOCK_OBJECTS.USER_ID
      })
    ).resolves.toBe(undefined);
  });
  it('prevents an admin from removing a role that does not exist on user', async () => {
    expect.assertions(1);
    MOCK_OBJECTS.ROLE = null;
    await expect(
      removeRole({
        dataStore: driver,
        requester: COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        collection: COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5,
        userId: MOCK_OBJECTS.USER_ID
      })
    ).rejects.toBeInstanceOf(ResourceError);
  });
  it('prevents a curator from removing a curator role from a user', async () => {
    expect.assertions(1);
    await expect(
      removeRole({
        dataStore: driver,
        requester: COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        collection: COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP,
        userId: MOCK_OBJECTS.USER_ID
      })
    ).rejects.toBeInstanceOf(ResourceError);
  });
});

describe('fetchReviewers', () => {
  it('allows an admin to fetch all reviewers for a colleciton', async () => {
    expect.assertions(1);
    await expect(
      fetchReviewers(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP
      )
    ).resolves.toBeInstanceOf(Array);
  });
  it('allows a curator to fetch all reviewers for a colleciton', async () => {
    expect.assertions(1);
    await expect(
      fetchReviewers(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP
      )
    ).resolves.toBeInstanceOf(Array);
  });
  it('prevents a curator from fetching all reviewers for a different collection', async () => {
    expect.assertions(1);
    await expect(
      fetchReviewers(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_C5
      )
    ).rejects.toBeInstanceOf(ResourceError);
  });
});

describe('fetchCurators', () => {
  it('allows an admin to fetch all curators for a colleciton', async () => {
    expect.assertions(1);
    await expect(
      fetchCurators(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP
      )
    ).resolves.toBeInstanceOf(Array);
  });
  it('prevents a curator from fetching all curators for a colleciton', async () => {
    expect.assertions(1);
    await expect(
      fetchCurators(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP
      )
    ).rejects.toBeInstanceOf(ResourceError);
  });
});

describe('fetchMembers', () => {
  it('allows an admin to fetch all members for a colleciton', async () => {
    expect.assertions(1);
    await expect(
      fetchMembers(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_ADMIN,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP
      )
    ).resolves.toBeInstanceOf(Array);
  });
  it('prevents a curator from fetching all members for a colleciton', async () => {
    expect.assertions(1);
    await expect(
      fetchMembers(
        driver,
        COLLECTION_ROLE_MOCK_OBJECTS.USER_TOKEN_CURATOR_NCCP,
        COLLECTION_ROLE_MOCK_OBJECTS.COLLECTION_NCCP
      )
    ).rejects.toBeInstanceOf(ResourceError);
  });
});
