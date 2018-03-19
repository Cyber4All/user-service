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
        let otaCode = await this.getOTACode(dataStore, email, action);
        return otaCode;
      } else {
        return Promise.reject('Invalid action');
      }
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public static async decode(
    dataStore: DataStore,
    otaCode: string
  ): Promise<any> {
    try {
      let decoded = await this.verifyOTACode(dataStore, otaCode);
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
      let decoded = await this.verifyOTACode(dataStore, otaCode, true);
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
      let emailValid = await dataStore.emailRegistered(email);
      if (emailValid) {
        let otaCode = await OTACodeManager.generate({ email: email }, action);
        await dataStore.insertOTACode(otaCode);
        return otaCode.code;
      }
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
      let otaID = await dataStore.findOTACode(otaCode);
      let decoded = await OTACodeManager.decode(otaCode, otaID);
      remove ? await dataStore.deleteOTACode(otaID) : 'DO NOT DELETE';
      return decoded;
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  }
}
