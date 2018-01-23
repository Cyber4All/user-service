import { ExpressResponder } from "@oriented/express";
import { Responder } from "../interfaces/interfaces";

export default class RouteResponder implements Responder {

  responder;

  constructor(private res: Response) {
    this.responder = new ExpressResponder(res);
  }

  sendOperationSuccess() {
    throw new Error("Method not implemented.");
  }
  sendOperationError(message: string, status?: number): void {
    this.responder.sendOperationError(message, status);
  }
  sendUser(user: any) {
    throw new Error("Method not implemented.");
  }
  invalidLogin() {
    throw new Error("Method not implemented.");
  }
  invalidRegistration() {
    throw new Error("Method not implemented.");
  }
  invalidAccess() {
    throw new Error("Method not implemented.");
  }
}
