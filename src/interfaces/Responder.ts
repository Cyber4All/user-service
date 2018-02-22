export interface Responder {
  sendUser(user);
  sendOperationSuccess();
  sendOperationError(message: string, status?: number): void;
  invalidLogin();
  invalidRegistration();
  invalidAccess();
}
