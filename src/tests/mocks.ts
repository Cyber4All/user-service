import * as dotenv from 'dotenv';
import { ACCOUNT_ACTIONS } from '../interfaces/Mailer.defaults';
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
  VALID_MAX_LENGTH_USERNAME: 'aaaaaaaaaaaaaaaaaaaa',
  USER_ID: '5a70fb5ed45bde3f9d65a88c',
  USER: {
    username: 'cypress',
    name: 'Clark Can',
    email: 'test@test.com',
    organization: 'towson university',
    password: '',
    bio: ''
  },
  OTACODE_ID: '5ba3dd816623db8690d7f0f7',
  SEARCH_COUNT: 1,
  ORGANIZATION: {
    institution: 'Amridge University'
  },
  DECODED_OTA_CODE: {
    data: 'test',
    action: ACCOUNT_ACTIONS.VERIFY_EMAIL
  },
  HASHED_PASSWORD: 'password'
};
