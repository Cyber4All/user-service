import * as express from 'express';
import { Router } from 'express';
import { DataStore, Responder, Mailer, HashInterface } from '../interfaces/interfaces';
import { login, register, validateToken, sendPasswordReset } from '../interactors/AuthenticationInteractor';
import { UserResponseFactory } from './drivers';
import { MailerInteractor } from '../interactors/MailInteractor';
const version = require('../package.json').version;
export default class RouteHandler {

  constructor(private dataStore: DataStore, private hasher: HashInterface, private mailer: Mailer, private responseFactory: UserResponseFactory) { }

  /**
   * Produces a configured express router
   *
   * @param dataStore the data store that the routes should utilize
   */
  public static buildRouter(dataStore: DataStore, hasher: HashInterface, mailer: Mailer, responseFactory) {
    let e = new RouteHandler(dataStore, hasher, mailer, responseFactory);
    let router: Router = express.Router();
    e.setRoutes(router);
    return router;
  }

  private setRoutes(router: Router) {

    // GET: returns welcome message and version number
    // No params necessary
    router.get('/users', (req, res) => {
      res.json({
        message: `Welcome to the Users API v${version}`,
        version: version
      });
    });

    // Register
    // POST: provide JSON object with new user info
    /*
    {
      "username": "string", 
      "firstname": "string", 
      "lastname": "string", 
      "email": "string", 
      "password": "string"
    }
    */
    // Returns either message warning invalid info, or success
    router.post('/users', async (req, res) => {
      await register(this.dataStore, this.responseFactory.buildResponder(res), this.hasher, req.body);
    });

    // Login
    router.post('/users/tokens', async (req, res) => {
      await login(this.dataStore, this.responseFactory.buildResponder(res), this.hasher, req.body.username, req.body.password);
    });

    // TODO: Remove account
    // When implemented...
    // provide token, which is then unauthorized, and return success message
    // Need to implement promise rejection catch - error message in console on failure.
    router.delete('/users/:username', async (req, res) => {
      this.responseFactory.buildResponder(res).sendOperationError('Cannot delete user accounts at this time');
      throw new Error('Cannot delete user accounts at this time');
    });


    router.route('/users/:username/tokens')
      // Validate Token
      // Param: Valid token (for testing, get from users/tokens route)
      // if valid, returns OK
      // else, returns "INVALID TOKEN"
      .post(async (req, res) => {
        validateToken(this.responseFactory.buildResponder(res), req.body.token);
      })

      // TODO: Logout
      // Currently throws unhandled promise rejection error, request cannot complete in postman
      .delete(async (req, res) => {
        throw new Error('Cannot logout at this time');
      });

    router.post('/users/passwords', async (req, res) => {
      let email = req.body.email;
      let mailer = new MailerInteractor(this.mailer);
      await sendPasswordReset(this.dataStore, this.responseFactory.buildResponder(res), mailer, email);
    })
  }
}