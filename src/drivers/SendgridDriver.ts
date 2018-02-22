import sgMail = require('@sendgrid/mail');
import * as dotenv from 'dotenv';
import { Mailer } from '../interfaces/interfaces';
dotenv.config();

export class SendgridDriver implements Mailer {

    private mailer = sgMail;
    constructor() {
        this.mailer.setApiKey(process.env.SENDGRID_API_KEY);
    }

    async sendSingle(to: string | string[], from: string, subject: string, text?: string, html?: string, cc?: string | string[], bcc?: string | string[], replyTo?: string, headers?: {}): Promise<any> {
        let email = {
            to: to,
            from: from,
            subject: subject,
        };
        text ? email['text'] = text : 'NO TEXT';
        html ? email['html'] = text : 'NO HTML';
        cc ? email['cc'] = text : 'NO CC';
        bcc ? email['bcc'] = text : 'NO BCC';
        replyTo ? email['replyTo'] = text : 'NO REPLY TO';
        headers ? email['headers'] = text : 'NO HEADERS';

        return this.mailer.send(email);
    }

    async sendMultiple(to: string[], from: string, subject: string, text?: string, html?: string, cc?: string | string[], bcc?: string | string[], replyTo?: string, headers?: {}): Promise<any> {
        let email = {
            to: to,
            from: from,
            subject: subject,
        };
        text ? email['text'] = text : 'NO TEXT';
        html ? email['html'] = text : 'NO HTML';
        cc ? email['cc'] = text : 'NO CC';
        bcc ? email['bcc'] = text : 'NO BCC';
        replyTo ? email['replyTo'] = text : 'NO REPLY TO';
        headers ? email['headers'] = text : 'NO HEADERS';

        return this.mailer.sendMultiple(email);
    }

    sendSingleTemplate(to: string | string[], from: string, subject: string, template: string, templateVars: {}, text?: string, html?: string, cc?: string | string[], bcc?: string | string[], replyTo?: string, headers?: {}): Promise<any> {
        let email = {
            to: to,
            from: from,
            subject: subject,
            templateId: template,
            substitutions: templateVars
        };
        text ? email['text'] = text : 'NO TEXT';
        html ? email['html'] = text : 'NO HTML';
        cc ? email['cc'] = text : 'NO CC';
        bcc ? email['bcc'] = text : 'NO BCC';
        replyTo ? email['replyTo'] = text : 'NO REPLY TO';
        headers ? email['headers'] = text : 'NO HEADERS';

        return this.mailer.send(email);
    }
    sendMultipleTemplate(to: string[], from: string, subject: string, template: string, templateVars: {}[], text?: string, html?: string, cc?: string | string[], bcc?: string | string[], replyTo?: string, headers?: {}): Promise<any> {
        throw new Error("Send multiple templates not yet implemented for Sendgrid");
    }

}