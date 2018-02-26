import { Mailer } from "../interfaces/interfaces";
import * as MAIL_DEFAULTS from "../interfaces/Mailer.defaults";
import { User } from "@cyber4all/clark-entity";

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
    otaCode: string
  ) {
    try {
      return await mailer.sendSingleTemplate(
        email,
        MAIL_DEFAULTS.FROM.NO_REPLY,
        MAIL_DEFAULTS.SUBJECTS.RESET_PASSWORD,
        MAIL_DEFAULTS.TEMPLATES.RESET_PASSWORD,
        {
          otaCode: otaCode
        }
      );
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
