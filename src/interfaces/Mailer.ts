import * as MAIL_DEFAULTS from './Mailer.defaults';
export interface Mailer {
    sendSingle(to: string | string[], from: string, subject: string, text?: string, html?: string, cc?: string | string[], bcc?: string | string[], replyTo?: string, headers?: {}): Promise<any>;
    sendMultiple(to: string[], from: string, subject: string, text?: string, html?: string, cc?: string | string[], bcc?: string | string[], replyTo?: string, headers?: {}): Promise<any>;
    sendSingleTemplate(to: string | string[], from: string, subject: string, template: MAIL_DEFAULTS.TEMPLATES, templateVars: {}, text?: string, html?: string, cc?: string | string[], bcc?: string | string[], replyTo?: string, headers?: {}): Promise<any>;
    sendMultipleTemplate(to: string[], from: string, subject: string, template: MAIL_DEFAULTS.TEMPLATES, templateVars: {}[], text?: string, html?: string, cc?: string | string[], bcc?: string | string[], replyTo?: string, headers?: {}): Promise<any>;
}