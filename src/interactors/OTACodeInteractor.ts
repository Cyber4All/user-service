import { DataStore, Responder } from "../interfaces/interfaces";
import { MailerInteractor } from "./MailerInteractor";
import { OTACodeManager } from "../drivers/drivers";
import { ACCOUNT_ACTIONS } from "../interfaces/Mailer.defaults";
import { REDIRECT_ROUTES } from "../environment/routes";
import { DecodedOTACode } from "../drivers/OTACodeManager";

export class OTACodeInteractor {
  public static handleAction(
    dataStore: DataStore,
    responder: Responder,
    action: ACCOUNT_ACTIONS,
    data: any,
    mailer?: MailerInteractor
  ): Promise<any> {
    switch (action) {
      case ACCOUNT_ACTIONS.VERIFY_EMAIL:
        return; //SUM FUNCTION THAT SENDS EMAIL VERIFICATION EMAIL
      case ACCOUNT_ACTIONS.RESET_PASSWORD:
        return this.sendPasswordReset(dataStore, responder, mailer, data);
      default:
        responder.sendOperationError("Action invalid");
        break;
    }
  }

  public static async handleRedirect(
    dataStore: DataStore,
    responder: Responder,
    otaCode: string
  ): Promise<any> {
    try {
      let decoded = await this.verifyOTACode(dataStore, otaCode);
      if (decoded)
        switch (decoded.action) {
          case ACCOUNT_ACTIONS.VERIFY_EMAIL:
            responder.redirectTo(REDIRECT_ROUTES.VERIFY_EMAIL);
            break; //SUM FUNCTION THAT SENDS EMAIL VERIFICATION EMAIL
          case ACCOUNT_ACTIONS.RESET_PASSWORD:
            responder.redirectTo(REDIRECT_ROUTES.RESET_PASSWORD(otaCode));
            break;
          default:
            responder.sendOperationError("Action invalid");
            break;
        }
    } catch (e) {
      responder.sendOperationError(e);
    }
  }

  public static async applyOTACode(
    dataStore: DataStore,
    otaCode: any
  ): Promise<any> {
    try {
      let decoded = await this.verifyOTACode(dataStore, otaCode, true);
      return decoded ? decoded : Promise.reject("Invalid OTA Code.");
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
      remove ? await dataStore.deleteOTACode(otaID) : "DO NOT DELETE";
      return decoded;
    } catch (e) {
      console.log(e);
      return Promise.resolve(null);
    }
  }

  private static async sendPasswordReset(
    datastore: DataStore,
    responder: Responder,
    mailer: MailerInteractor,
    email: string
  ) {
    try {
      let emailValid = await datastore.emailRegistered(email);
      if (emailValid) {
        let otaCode = await OTACodeManager.generate(
          { email: email },
          ACCOUNT_ACTIONS.RESET_PASSWORD
        );
        await datastore.insertOTACode(otaCode);
        await mailer.sendPasswordReset(email, otaCode.code);
        responder.sendOperationSuccess();
      } else {
        responder.sendOperationSuccess();
      }
    } catch (e) {
      responder.sendOperationError(`Problem sending email. Error: ${e}`);
    }
  }
}
