export interface Responder {
  sendUser(user: any): void;
  sendOperationSuccess(): void;
  sendOperationError(message: string, status?: number): void;
  invalidLogin(): void;
  invalidRegistration(): void;
  invalidAccess(): void;
  redirectTo(url: string): void;
  setCookie(key: string, value: string): void;
  removeCookie(key: string): void;
  sendObject(obj: object): void; 
}
