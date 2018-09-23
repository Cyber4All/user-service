import * as dotenv from 'dotenv';
dotenv.config();

export const MOCK_OBJECTS = {
  USERNAME_QUERY: { username: 'nvisal1' },
  EMPTY_USERNAME_QUERY: { username: '' },
  USERNAME: 'cypress',
  PASSWORD: 'Clarktesting1!',
  EMAIL: 'test@test.com',
  EMPTY_STRING: '',
  LONG_USERNAME: 'abcdefghijklmnopqrstuvwxyz',
  SHORT_USERNAME: '12',
  VALID_LONG_USERNAME: 'myshortusername',
  VALID_SHORT_USERNAME: '123',
  VALID_MAX_LENGTH_USERNAME: 'aaaaaaaaaaaaaaaaaaaa'

  
};
