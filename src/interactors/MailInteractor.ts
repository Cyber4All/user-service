import { Mailer } from '../interfaces/interfaces';
import * as MAIL_DEFAULTS from '../interfaces/Mailer.defaults';

export class MailerInteractor {

    constructor(private mailer: Mailer) { }

    async sendPasswordReset(email: string, otaCode: string) {
        try {
            return await this.mailer.sendSingleTemplate(
                email,
                MAIL_DEFAULTS.FROM.NO_REPLY,
                MAIL_DEFAULTS.SUBJECTS.PASSWORD_RESET,
                MAIL_DEFAULTS.TEMPLATES.RESET_PASSWORD,
                { action: MAIL_DEFAULTS.ACCOUNT_ACTIONS.RESET_PASSWORD, otaCode: otaCode }
            );
        } catch (e) {
            return Promise.reject(e);
        }
    }
}