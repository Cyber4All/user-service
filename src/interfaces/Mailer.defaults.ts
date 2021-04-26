export enum FROM {
  NO_REPLY = 'C.L.A.R.K. <noreply@secured.team>'
}
export enum SUBJECTS {
  VERIFY_EMAIL = 'Verify your email',
  WELCOME_EMAIL = 'Welcome to C.L.A.R.K.',
  RESET_PASSWORD = 'Reset your password'
}
export enum ACCOUNT_ACTIONS {
  VERIFY_EMAIL = 'verifyEmail',
  RESET_PASSWORD = 'resetPassword'
}
export enum TEMPLATES {
  VERIFY_EMAIL = 'verify email',
  WELCOME_EMAIL = 'welcome email',
  RESET_PASSWORD = 'reset password'
}
export const TEMPLATE_VARIABLES = new Map<
  TEMPLATES,
  { [index: string]: any }
>();

TEMPLATE_VARIABLES.set(TEMPLATES.VERIFY_EMAIL, { otaCode: '' });
TEMPLATE_VARIABLES.set(TEMPLATES.WELCOME_EMAIL, {});
TEMPLATE_VARIABLES.set(TEMPLATES.RESET_PASSWORD, { otaCode: '' });

export type MailTemplate = {
  name: string;
  templateVariables: { [index: string]: any };
};

export const SYSTEM_ONLY_TEMPLATES = [
  TEMPLATES.RESET_PASSWORD,
  TEMPLATES.VERIFY_EMAIL
];
