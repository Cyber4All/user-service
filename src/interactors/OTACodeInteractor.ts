import {
  DataStore,
  Responder,
  MailerInteractorInterface
} from '../interfaces/interfaces';
import { OTACodeManager } from '../drivers/drivers';
import { ACCOUNT_ACTIONS } from '../interfaces/Mailer.defaults';
import { REDIRECT_ROUTES } from '../environment/routes';
import { DecodedOTACode, OTACode } from '../drivers/OTACodeManager';
import * as request from 'request';

export class OTACodeInteractor {
  public static async generateOTACode(
    dataStore: DataStore,
    action: ACCOUNT_ACTIONS,
    email: string
  ): Promise<string> {
    try {
      const actions = Object.keys(ACCOUNT_ACTIONS).map(k => ACCOUNT_ACTIONS[k]);

      if (actions.includes(action)) {
        const otaCode = await this.getOTACode(dataStore, email, action);
        return otaCode;
      }
      return Promise.reject('Invalid action');
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public static async decode(
    dataStore: DataStore,
    otaCode: string
  ): Promise<any> {
    try {
      const decoded = await this.verifyOTACode(dataStore, otaCode);
      return decoded;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public static async applyOTACode(
    dataStore: DataStore,
    otaCode: string
  ): Promise<any> {
    try {
      const decoded = await this.verifyOTACode(dataStore, otaCode, true);
      return decoded;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  private static async getOTACode(
    dataStore: DataStore,
    email: string,
    action: ACCOUNT_ACTIONS
  ): Promise<string> {
    try {
      const emailValid = await dataStore.identifierInUse(email);
      if (emailValid) {
        let expiration;
        if (action === ACCOUNT_ACTIONS.VERIFY_EMAIL) {
          expiration = '2h';
        }
        const otaCode = await OTACodeManager.generate(
          { email },
          action,
          expiration
        );
        await dataStore.insertOTACode(otaCode);
        return otaCode.code;
      }
      return Promise.reject('Invalid email');
    } catch (e) {
      return Promise.reject(e);
    }
  }

  private static async verifyOTACode(
    dataStore: DataStore,
    otaCode: string,
    remove?: boolean
  ): Promise<DecodedOTACode> {
    try {
      const otaID = await dataStore.findOTACode(otaCode);
      const decoded = await OTACodeManager.decode(otaCode, otaID);
      if (remove) {
        await dataStore.deleteOTACode(otaID);
      }
      return decoded;
    } catch (e) {
      let error = 'Invalid OTA code';
      if (e.message && /expired/gi.test(e.message)) {
        error = 'Link expired';
      }
      return Promise.reject(`${error}. E: ${e}`);
    }
  }
}
