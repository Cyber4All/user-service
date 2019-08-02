import { Mailer, DataStore, Responder } from '../interfaces/interfaces';
import * as MAIL_DEFAULTS from '../interfaces/Mailer.defaults';
import { User } from '../shared/typings';

const RESPONSE_TEXT = {
  EMAIL_NOT_REGISTERED_WITH_ACCOUNT:
    'The provided email address is not associated with an account'
};

export class MailerInteractor {
  /**
   * Sends single basic email
   *
   * @static
   * @param {Mailer} mailer
   * @param {{ subject: string; email: string; message: string }} params
   * @returns {Promise<void>}
   * @memberof MailerInteractor
   */
  public static async sendBasicEmail(
    mailer: Mailer,
    params: { subject: string; email: string; message: string }
  ): Promise<void> {
    try {
      return mailer.sendSingle(
        params.email,
        MAIL_DEFAULTS.FROM.NO_REPLY,
        params.subject,
        params.message
      );
    } catch (e) {
      return Promise.reject(`Problem sending email. Error: ${e}`);
    }
  }
  /**
   * Sends single template email
   *
   * @static
   * @param {Mailer} mailer
   * @param {{ subject: string; email: string }} params
   * @param {MAIL_DEFAULTS.TEMPLATES} template
   * @param {{ [index: string]: string }} templateVars
   * @returns
   * @memberof MailerInteractor
   */
  public static async sendTemplateEmail(
    mailer: Mailer,
    params: { subject: string; email: string },
    template: MAIL_DEFAULTS.TEMPLATES,
    templateVars: { [index: string]: string }
  ) {
    try {
      if (
        !Object.keys(MAIL_DEFAULTS.TEMPLATES)
          .map(KEY => MAIL_DEFAULTS.TEMPLATES[KEY])
          .includes(template)
      ) {
        return Promise.reject('Invalid template option.');
      }
      return mailer.sendSingleTemplate(
        params.email,
        MAIL_DEFAULTS.FROM.NO_REPLY,
        params.subject,
        template,
        templateVars
      );
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * Sends verification email
   *
   * @static
   * @param {Mailer} mailer
   * @param {string} email
   * @param {string} otaCode
   * @returns
   * @memberof MailerInteractor
   */
  public static async sendEmailVerification(
    mailer: Mailer,
    email: string,
    otaCode: string
  ) {
    try {
      return this.sendTemplateEmail(
        mailer,
        { email, subject: MAIL_DEFAULTS.SUBJECTS.VERIFY_EMAIL },
        MAIL_DEFAULTS.TEMPLATES.VERIFY_EMAIL,
        {
          otaCode
        }
      );
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * Sends welcome email
   *
   * @static
   * @param {Mailer} mailer
   * @param {User} user
   * @returns
   * @memberof MailerInteractor
   */
  public static async sendWelcomeEmail(mailer: Mailer, user: User) {
    try {
      return this.sendTemplateEmail(
        mailer,
        { email: user.email, subject: MAIL_DEFAULTS.SUBJECTS.WELCOME_EMAIL },
        MAIL_DEFAULTS.TEMPLATES.WELCOME_EMAIL,
        {
          name: user.name
        }
      );
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * Sends password reset email if email is valid
   *
   * @static
   * @param {Mailer} mailer
   * @param {string} email
   * @param {string} otaCode
   * @param {DataStore} dataStore
   * @param {Responder} responder
   * @returns
   * @memberof MailerInteractor
   */
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
        responder.sendOperationError(
          RESPONSE_TEXT.EMAIL_NOT_REGISTERED_WITH_ACCOUNT,
          404
        );
      }
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * Returns available Mail Templates
   *
   * @static
   * @returns {MailTemplate[]}
   * @memberof MailerInteractor
   */
  public static getTemplates(): MAIL_DEFAULTS.MailTemplate[] {
    let templates = Object.keys(MAIL_DEFAULTS.TEMPLATES).map(
      KEY => MAIL_DEFAULTS.TEMPLATES[KEY]
    );
    templates = templates
      .filter(
        (name: MAIL_DEFAULTS.TEMPLATES) =>
          !MAIL_DEFAULTS.SYSTEM_ONLY_TEMPLATES.includes(name)
      )
      .map((name: MAIL_DEFAULTS.TEMPLATES) => {
        const template = {
          name,
          templateVariables: MAIL_DEFAULTS.TEMPLATE_VARIABLES.get(name)
        };
        return template;
      });
    return templates;
  }
  /**
   * Checks if email provided is registered
   *
   * @private
   * @static
   * @param {string} email
   * @param {DataStore} dataStore
   * @returns {Promise<boolean>}
   * @memberof MailerInteractor
   */
  private static async isValidEmail(
    email: string,
    dataStore: DataStore
  ): Promise<boolean> {
    const response = await dataStore.searchUsers({ email });
    return response.users.length > 0;
  }
  /**
   *Sends Password Reset email
   *
   * @private
   * @static
   * @param {{
   *     mailer: Mailer;
   *     email: string;
   *     otaCode: string;
   *   }} {
   *     mailer,
   *     email,
   *     otaCode
   *   }
   * @memberof MailerInteractor
   */
  private static async sendPasswordResetEmail({
    mailer,
    email,
    otaCode
  }: {
    mailer: Mailer;
    email: string;
    otaCode: string;
  }) {
    await this.sendTemplateEmail(
      mailer,
      { email, subject: MAIL_DEFAULTS.SUBJECTS.RESET_PASSWORD },
      MAIL_DEFAULTS.TEMPLATES.RESET_PASSWORD,
      {
        otaCode
      }
    );
  }
}
