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
    console.log('success');
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
  sendUser(user: User) {
    const t = user.token;
    delete user.token;
    delete user.password;
    this.res.status(200).json(user);
  }

  sendObject(obj: object) {
    this.res.json(obj);
  }

  sendPasswordMatch(isMatch: boolean) {
    this.res.status(200).json(isMatch);
  }
  /**

   *
   */
  invalidLogin() {
    this.res.status(400).send('Invalid Username or Password');
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

  setCookie(key: string, value: string): any {
    let options = {
      maxAge: 604800000,
      httpOnly: false,
      domain: process.env.COOKIE_DOMAIN,
      secure: process.env.NODE_ENV !== 'development'
    };

    return this.res.cookie(key, value, options);
  }

  removeCookie(name: string): any {
    let options = {
      domain: process.env.COOKIE_DOMAIN,
      path: '/'
    };

    return this.res.clearCookie(name, options);
  }
}
