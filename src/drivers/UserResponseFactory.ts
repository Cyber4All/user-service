import RouteResponder from './RouteResponder';
import { Responder } from '../interfaces/interfaces';

export class UserResponseFactory {
  public buildResponder(res): Responder {
    return new RouteResponder(res);
  }
}
