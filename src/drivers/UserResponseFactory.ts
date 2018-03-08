import RouteResponder from './RouteResponder';
import { Responder } from '../interfaces/interfaces';
import { Response } from 'express';

export class UserResponseFactory {
  public buildResponder(res: Response): Responder {
    return new RouteResponder(res);
  }
}
