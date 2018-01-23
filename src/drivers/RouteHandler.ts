import * as express from 'express';
import { Router } from 'express';
import { DataStore, Responder } from '../interfaces/interfaces';
import { login, register, validateToken } from '../interactors/AuthenticationInteractor';
import { UserResponseFactory } from './drivers';

export default class RouteHandler {
  
  constructor(private dataStore: DataStore, private responseFactory: UserResponseFactory) { }

  /**
   * Produces a configured express router
   *
   * @param dataStore the data store that the routes should utilize
   */
  public static buildRouter(dataStore, responseFactory) {
    let e = new RouteHandler(dataStore, responseFactory);
    let router: Router = express.Router();
    e.setRoutes(router);
    return router;
  }

  private setRoutes(router: Router) {
    router.get('/users', (req, res) => {
      res.json({ message: 'Welcome to the Users API' });
    });
    // Register
    router.post('/users', async (req, res) => {
        await register(this.dataStore, this.responseFactory.buildResponder(res), req.body);
    });
    // Login
    router.post('/users/tokens', async (req, res) => {
      await login(this.dataStore, this.responseFactory.buildResponder(res), req.body.username, req.body.password);
    });
    // TODO: Remove account
    router.delete('/users/:username', async (req, res) => {
      this.responseFactory.buildResponder(res).sendOperationError('Cannot delete user accounts at this time');
      throw new Error('Cannot delete user accounts at this time');
    });
    router.route('/users/:username/tokens')
      // Validate Token
      .post(async (req, res) => {
        validateToken(this.responseFactory.buildResponder(res), req.body.token);
      })
      // TODO: Logout
      .delete(async (req, res) => {
        throw new Error('Cannot logout at this time');
      });
  }
}