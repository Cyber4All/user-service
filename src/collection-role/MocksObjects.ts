export const COLLECTION_ROLE_MOCK_OBJECTS = {
  COLLECTION_NCCP: 'nccp',
  COLLECTION_C5: 'c5',
  COLLECTION_SECJ: 'secj',
  ROLE_CURATOR: 'curator',
  ROLE_REVIEWER: 'reviewer',
  USER_TOKEN_ADMIN: {
    username: 'admin',
    name: 'unit test',
    email: 'test@admin.com',
    organization: 'admin',
    emailVerified: false,
    accessGroups: ['admin'],
  },
  USER_TOKEN_CURATOR_C5: {
    username: 'curator',
    name: 'unit test',
    email: 'test@curator.com',
    organization: 'curator',
    emailVerified: false,
    accessGroups: ['curator@c5'],
  },
  USER_TOKEN_CURATOR_NCCP: {
    username: 'curator',
    name: 'unit test',
    email: 'test@curator.com',
    organization: 'curator',
    emailVerified: false,
    accessGroups: ['curator@nccp'],
  },
};