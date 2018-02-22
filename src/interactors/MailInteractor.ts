import { Mailer } from '../interfaces/interfaces';

export class MailerInteractor {

    constructor(private mailer: Mailer) {

    }

    async sendPasswordReset(email: string) {
        try {
            return await this.mailer.sendSingle(email, FROM.NO_REPLY, SUBJECTS.PASSWORD_RESET)
        } catch (e) {
            return Promise.reject(e);
        }
    }
}

export const enum FROM {
    NO_REPLY = 'noreply@clark.center',
}
export const enum SUBJECTS {
    PASSWORD_RESET = 'Reset your password',
} 