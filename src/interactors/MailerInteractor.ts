import { Mailer, DataStore, Responder } from '../interfaces/interfaces';
import * as MAIL_DEFAULTS from '../interfaces/Mailer.defaults';
import { User } from '@cyber4all/clark-entity';

const RESPONSE_TEXT = {
  EMAIL_NOT_REGISTERED_WITH_ACCOUNT: 'The provided email address is not associated with an account'
}

export class MailerInteractor {
  public static async sendEmailVerification(
    mailer: Mailer,
    email: string,
    otaCode: string
  ) {
    try {
      return await mailer.sendSingleTemplate(
        email,
        MAIL_DEFAULTS.FROM.NO_REPLY,
        MAIL_DEFAULTS.SUBJECTS.VERIFY_EMAIL,
        MAIL_DEFAULTS.TEMPLATES.VERIFY_EMAIL,
        {
          otaCode: otaCode
        }
      );
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public static async sendWelcomeEmail(mailer: Mailer, user: User) {
    try {
      return await mailer.sendSingleTemplate(
        user.email,
        MAIL_DEFAULTS.FROM.NO_REPLY,
        MAIL_DEFAULTS.SUBJECTS.WELCOME_EMAIL,
        MAIL_DEFAULTS.TEMPLATES.WELCOME_EMAIL,
        {
          name: user.name
        }
      );
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public static async sendPasswordReset(
    mailer: Mailer,
    email: string,
    otaCode: string,
    dataStore: DataStore,
    responder: Responder
  ) {
    try {
      if (await this.isValidEmail(email, dataStore)) {
        await this.sendPasswordResetEmail({ mailer, email, otaCode });
        responder.sendOperationSuccess();
      } else {
        responder.sendOperationError(RESPONSE_TEXT.EMAIL_NOT_REGISTERED_WITH_ACCOUNT, 404);
      }
    } catch (e) {
      return Promise.reject(e);
    }
  }

  private static async isValidEmail(email: string, dataStore: DataStore): Promise<boolean> {
    const users = await dataStore.searchUsers({ email });
    return users.length > 0;
  }

  private static async sendPasswordResetEmail(
    { mailer, email, otaCode }: { mailer: Mailer, email: string, otaCode: string }
  ) {
    await mailer.sendSingleTemplate(
      email,
      MAIL_DEFAULTS.FROM.NO_REPLY,
      MAIL_DEFAULTS.SUBJECTS.RESET_PASSWORD,
      MAIL_DEFAULTS.TEMPLATES.RESET_PASSWORD,
      {
        otaCode
      }
    );
  }
}
