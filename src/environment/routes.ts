import * as dotenv from 'dotenv';
dotenv.config();

export const REDIRECT_ROUTES = {
  VERIFY_EMAIL: `${process.env.EMAIL_VERIFIED_REDIRECT}`,
  RESET_PASSWORD(otaCode: string): string {
    return `${process.env.AUTH_REDIRECT}?otaCode=${otaCode}`;
  }
};
