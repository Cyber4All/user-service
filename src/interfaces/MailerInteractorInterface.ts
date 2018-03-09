import { User } from '@cyber4all/clark-entity';

export interface MailerInteractorInterface {
  sendEmailVerification(email: string, otaCode: string): Promise<void>;
  sendWelcomeEmail(user: User): Promise<void>;
  sendPasswordReset(email: string, otaCode: string): Promise<void>;
}
