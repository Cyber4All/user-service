import * as dotenv from "dotenv";
dotenv.config();

export const REDIRECT_ROUTES = {
  VERIFY_EMAIL: `${process.env.DEFAULT_REDIRECT}`,
  // FIXME: JANKY Solution, should not make request to self! PLZ FIX (HELP NEEDED - Gus)
  SELF(otaCode: string): string {
    return `${process.env.SELF_REDIRECT}?otaCode=${otaCode}`;
  },
  RESET_PASSWORD(otaCode: string): string {
    return `${process.env.AUTH_REDIRECT}?otaCode=${otaCode}`;
  }
};
