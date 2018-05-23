import * as express from 'express';
type Router = express.Router;
import { DataStore, Mailer } from '../interfaces/interfaces';
import { UserResponseFactory } from './drivers';
import { AdminUserInteractor } from '../interactors/AdminUserInteractor';
const version = require('../package.json').version;

export default class AdminRouteHandler {
  constructor(
    private dataStore: DataStore,
    private mailer: Mailer,
    private responseFactory: UserResponseFactory
  ) {}

  /**
   * Produces a configured express router
   *
   * @param dataStore the data store that the routes should utilize
   */
  public static buildRouter(
    dataStore: DataStore,
    mailer: Mailer,
    responseFactory: UserResponseFactory
  ) {
    const e = new AdminRouteHandler(dataStore, mailer, responseFactory);
    const router: Router = express.Router();
    e.setRoutes(router);
    return router;
  }

  private setRoutes(router: Router) {
    // GET: returns welcome message and version number
    // No params necessary
    router.get('/', (req, res) => {
      res.json({
        version,
        message: `Welcome to the Users Admin API v${version}`
      });
    });
    router.get('/users', async (req, res) => {
      const responder = this.responseFactory.buildResponder(res);
      try {
        const query = req.query;
        const users = await AdminUserInteractor.fetchUsers(
          this.dataStore,
          query
        );
        responder.sendObject(users);
      } catch (e) {
        responder.sendOperationError(e);
      }
    });
  }
}
