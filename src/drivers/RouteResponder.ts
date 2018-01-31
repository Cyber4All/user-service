import { ExpressResponder } from "@oriented/express";
import { Responder } from "../interfaces/interfaces";
import { Response } from 'express';

export default class RouteResponder implements Responder {

  constructor(private res: Response) {
  }

  sendOperationSuccess() {
    this.res.sendStatus(200);
  }
  sendOperationError(message: string, status?: number): void {
    message && status ? this.res.status(status).send(message)
      : message && !status ? this.res.status(400).send(message)
        : !message && status ? this.res.status(status).send("Server error encounter.")
          : this.res.status(400).send("Server error encounter.");
  }
  sendUser(user: any) {
    this.res.status(200).json(user);
  }
  invalidLogin() {
    this.res.status(400).json({ message: 'Invalid Username or Password' });
  }
  invalidRegistration() {
    this.res.status(400).send('Invalid registration credentials');
  }
  invalidAccess() {
    this.res.status(401).send('Invalid access token');
  }
}
