import { Responder } from '../interfaces/interfaces';
import { Response } from 'express';
import { User } from '@cyber4all/clark-entity';

export default class RouteResponder implements Responder {
  /**
   *
   * @param res
   */
  constructor(private res: Response) {}

  /**
   *
   */
  sendOperationSuccess() {
    this.res.sendStatus(200);
  }

  /**
   *
   * @param message
   * @param status
   */
  sendOperationError(message: string, status?: number): void {
    message && status
      ? this.res.status(status).send(message)
      : message && !status
        ? this.res.status(400).send(message)
        : !message && status
          ? this.res.status(status).send('Server error encountered.')
          : this.res.status(400).send('Server error encountered.');
  }

  /**
   *
   * @param user
   */
  sendUser(user: {} | User) {
    const t = user['token'];
    delete user['token'];
    delete user['_pwd'];
    this.res.status(200).json(user);
  }
  /**

   *
   */
  invalidLogin() {
    this.res.status(400).json({ message: 'Invalid Username or Password' });
  }

  /**
   *
   */
  invalidRegistration() {
    this.res.status(400).send('Invalid registration credentials');
  }

  /**
   *
   */
  invalidAccess() {
    this.res.status(401).send('Invalid access token');
  }

  redirectTo(url: string) {
    this.res.redirect(url);
  }

  setCookie(key: string, value: string): Response {
    return this.res.cookie(key, value, { maxAge: 900000, httpOnly: false });
  }

  removeCookie(name: string): Response {
    return this.res.clearCookie(name);
    return this.res;
  }
}
