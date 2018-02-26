import sgMail = require("@sendgrid/mail");
import * as dotenv from "dotenv";
import { Mailer } from "../interfaces/interfaces";
import * as MAIL_DEFAULTS from "../interfaces/Mailer.defaults";
dotenv.config();

export enum SENDGRID_TEMPLATES {
  VERIFY_EMAIL = "3b741215-9b4c-4a2a-9fb0-27c1b9bf950f",
  WELCOME_EMAIL = "9c64ee0e-c772-4887-b510-38d13fd02338",
  RESET_PASSWORD = "ef42659c-df2a-4c29-a8bc-cc99054cd3fa"
}
export class SendgridDriver implements Mailer {
  private mailer = sgMail;
  private TEMPLATES = new Map<MAIL_DEFAULTS.TEMPLATES, string>();

  constructor() {
    this.mailer.setApiKey(process.env.SENDGRID_API_KEY);
    this.mailer.setSubstitutionWrappers("{{", "}}");

    // Add template ids
    this.TEMPLATES.set(
      MAIL_DEFAULTS.TEMPLATES.VERIFY_EMAIL,
      SENDGRID_TEMPLATES.VERIFY_EMAIL
    );
    this.TEMPLATES.set(
      MAIL_DEFAULTS.TEMPLATES.WELCOME_EMAIL,
      SENDGRID_TEMPLATES.WELCOME_EMAIL
    );
    this.TEMPLATES.set(
      MAIL_DEFAULTS.TEMPLATES.RESET_PASSWORD,
      SENDGRID_TEMPLATES.RESET_PASSWORD
    );
  }

  async sendSingle(
    to: string | string[],
    from: string,
    subject: string,
    text?: string,
    html?: string,
    cc?: string | string[],
    bcc?: string | string[],
    replyTo?: string,
    headers?: {}
  ): Promise<any> {
    let email = {
      to: to,
      from: from,
      subject: subject
    };
    text ? (email["text"] = text) : "NO TEXT";
    html ? (email["html"] = text) : "NO HTML";
    cc ? (email["cc"] = text) : "NO CC";
    bcc ? (email["bcc"] = text) : "NO BCC";
    replyTo ? (email["replyTo"] = text) : "NO REPLY TO";
    headers ? (email["headers"] = text) : "NO HEADERS";

    return this.mailer.send(email);
  }

  async sendMultiple(
    to: string[],
    from: string,
    subject: string,
    text?: string,
    html?: string,
    cc?: string | string[],
    bcc?: string | string[],
    replyTo?: string,
    headers?: {}
  ): Promise<any> {
    let email = {
      to: to,
      from: from,
      subject: subject
    };
    text ? (email["text"] = text) : "NO TEXT";
    html ? (email["html"] = text) : "NO HTML";
    cc ? (email["cc"] = text) : "NO CC";
    bcc ? (email["bcc"] = text) : "NO BCC";
    replyTo ? (email["replyTo"] = text) : "NO REPLY TO";
    headers ? (email["headers"] = text) : "NO HEADERS";

    return this.mailer.sendMultiple(email);
  }

  sendSingleTemplate(
    to: string | string[],
    from: string,
    subject: string,
    templateType: MAIL_DEFAULTS.TEMPLATES,
    templateVars: {},
    text?: string,
    html?: string,
    cc?: string | string[],
    bcc?: string | string[],
    replyTo?: string,
    headers?: {}
  ): Promise<any> {
    let email = {
      to: to,
      from: from,
      subject: subject,
      templateId: this.getTemplate(templateType),
      substitutions: templateVars
    };
    text ? (email["text"] = text) : "NO TEXT";
    html ? (email["html"] = text) : "NO HTML";
    cc ? (email["cc"] = text) : "NO CC";
    bcc ? (email["bcc"] = text) : "NO BCC";
    replyTo ? (email["replyTo"] = text) : "NO REPLY TO";
    headers ? (email["headers"] = text) : "NO HEADERS";

    return this.mailer.send(email);
  }
  sendMultipleTemplate(
    to: string[],
    from: string,
    subject: string,
    templateType: MAIL_DEFAULTS.TEMPLATES,
    templateVars: {}[],
    text?: string,
    html?: string,
    cc?: string | string[],
    bcc?: string | string[],
    replyTo?: string,
    headers?: {}
  ): Promise<any> {
    throw new Error("Send multiple templates not yet implemented for Sendgrid");
  }

  private getTemplate(template: MAIL_DEFAULTS.TEMPLATES): string {
    let id = this.TEMPLATES.get(template);
    if (id) return id;
    throw new Error(`No existing template for: ${template}`);
  }
}
