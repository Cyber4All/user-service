export interface Responder {
  sendUser(user: any): void;
  sendOperationSuccess(): void;
  sendOperationError(message: string, status?: number): void;
  invalidLogin(): void;
  invalidRegistration(): void;
  invalidAccess(): void;
  redirectTo(url: string): void;
<<<<<<< HEAD
  setCookie(key: string, value: string): void;
  removeCookie(key: string): void;
  sendObject(obj: object): void; 
=======
  setCookie(key: string, value: string): any;
  removeCookie(key: string): any;
>>>>>>> 8f3f6f253279f257945a0925f3b8e3faa5f6afed
}
