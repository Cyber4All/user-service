export interface Responder {
  sendUser(user: any);
  sendOperationSuccess();
  sendOperationError(message: string, status?: number): void;
  invalidLogin();
  invalidRegistration();
  invalidAccess();
  redirectTo(url: string);
}
