import * as express from 'express';
type Router = express.Router;
import { DataStore, HashInterface } from '../interfaces/interfaces';
import { passwordMatch } from '../interactors/AuthenticationInteractor';
import { UserResponseFactory, RouteHandler } from './drivers';
import { UserInteractor } from '../interactors/interactors';
import { reportError } from './SentryConnector';
import * as AuthInteractor from '../interactors/AuthenticationInteractor';
import { initializePrivate } from '../collection-role/RouteHandler';
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
    router.use((req, res, next) => {
      // If the username in the cookie is not lowercase and error will be reported
      // and the value adjusted to be lowercase
      if (!(req.user.username === req.user.username.toLowerCase())) {
        // This odd try/catch setup is so that we don't abort the current operation,
        // but still have Sentry realize that an error was thrown.
        try {
          throw new Error(
            `${
              req.user.username
            } was retrieved from the token. Should be lowercase`
          );
        } catch (e) {
          console.log(e.message);
          reportError(e);
        }
        req.user.username = req.user.username.toLowerCase();
      }
      next();
    });
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

    router.route('/users/password').post(async (req, res) => {
      const responder = this.responseFactory.buildResponder(res);
      try {
        const match = await passwordMatch(
          this.dataStore,
          this.hasher,
          req.user.username,
          req.body.password
        );
        responder.sendPasswordMatch(match);
      } catch (e) {
        responder.sendOperationError(e);
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
        const userPayload = await AuthInteractor.refreshToken({
          dataStore: this.dataStore,
          username: req.user.username
        });
        responder.setCookie('presence', userPayload.token);
        responder.sendUser(userPayload.user.toPlainObject());
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

    router.use(initializePrivate({ dataStore: this.dataStore }));
  }

  private hasAccess(token: any, propName: string, value: any): boolean {
    return token[propName] === value;
  }
}
