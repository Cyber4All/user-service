import * as express from 'express';
type Router = express.Router;
import { DataStore, HashInterface } from '../interfaces/interfaces';
import { passwordMatch } from '../interactors/AuthenticationInteractor';
import { UserResponseFactory } from './drivers';
import { UserInteractor } from '../interactors/interactors';
import { generateToken } from './TokenManager';

export default class AuthRouteHandler {
  constructor(
    private dataStore: DataStore,
    private hasher: HashInterface,
    private responseFactory: UserResponseFactory
  ) {}

  /**
   * Produces a configured express router
   *
   * @param dataStore the data store that the routes should utilize
   */
  public static buildRouter(
    dataStore: DataStore,
    hasher: HashInterface,
    responseFactory: UserResponseFactory
  ) {
    const e = new AuthRouteHandler(dataStore, hasher, responseFactory);
    const router: Router = express.Router();
    e.setRoutes(router);
    return router;
  }

  private setRoutes(router: Router) {
    // Register
    // POST: provide JSON object with new user info
    /*
        {
          "username": "string", 
          "firstname": "string", 
          "lastname": "string", 
          "email": "string", 
          "password": "string",
          organization: string
        }
        */
    // Returns either message warning invalid info, or success
    router.route('/users').patch(async (req, res) => {
      const responder = this.responseFactory.buildResponder(res);
      try {
        if (req.body.user) {
          await UserInteractor.editInfo(
            this.dataStore,
            responder,
            this.hasher,
            req.user.username,
            req.body.user
          );
          responder.sendOperationSuccess();
        }
      } catch (e) {
        responder.sendOperationError(e);
      }
    });

    router.route('/users/password').get(async (req, res) => {
      try {
        passwordMatch(
          this.dataStore,
          this.responseFactory.buildResponder(res),
          this.hasher,
          req.user.username,
          req.query.password
        );
      } catch (e) {
        console.log(e);
      }
    });

    router
      .route('/users/tokens')
      // Validate Token
      // Param: Valid token (for testing, get from users/tokens route)
      // if valid, returns OK
      // else, returns "INVALID TOKEN"
      .get(async (req, res) => {
        const responder = this.responseFactory.buildResponder(res);
        try {
          responder.sendUser(req.user);
        } catch (e) {
          responder.sendOperationError('Invalid token');
        }
      });

    // refresh token
    router.get('/users/tokens/refresh', async (req, res) => {
      const responder = this.responseFactory.buildResponder(res);
      try {
        const user = await UserInteractor.loadUser(
          this.dataStore,
          req.user.username
        );

        if (user) {
          const token = generateToken(user);
          responder.setCookie('presence', token);
          responder.sendUser(user);
        } else {
          responder.sendOperationError('Error: No user found');
        }
      } catch (error) {
        responder.sendOperationError(`Error refreshing token ${error}`);
      }
    });

    router.delete('/users/:username/tokens', async (req, res) => {
      const responder = this.responseFactory.buildResponder(res);
      const username = req.params.username;
      const user = req.user;
      if (this.hasAccess(user, 'username', username)) {
        responder.removeCookie('presence');
        responder.sendOperationSuccess();
      } else {
        responder.unauthorized();
      }
    });

    router.delete('/users/:username/account', async (req, res) => {
      const responder = this.responseFactory.buildResponder(res);
      try {
        const user = req.user;
        const username = req.params.username;
        if (this.hasAccess(user, 'username', username)) {
          await UserInteractor.deleteUser(this.dataStore, username);
          responder.removeCookie('presence');
          responder.sendOperationSuccess();
        } else {
          responder.unauthorized();
        }
      } catch (e) {
        responder.sendOperationError(e);
      }
    });
  }

  private hasAccess(token: any, propName: string, value: any): boolean {
    return token[propName] === value;
  }
}
