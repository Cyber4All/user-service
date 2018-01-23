import * as express from 'express';
import { Router } from 'express';
import { DataStore } from '../interfaces/interfaces';

export default class RouteHandler {
  
  constructor(dataStore: DataStore) { }

  /**
   * Produces a configured express router
   *
   * @param dataStore the data store that the routes should utilize
   */
  public static buildRouter(dataStore) {
    let e = new RouteHandler(dataStore);
    let router: Router = express.Router();
    e.setRoutes(router);
    return router;
  }

  private setRoutes(router: Router) {
    router.get('/', function (req, res) {
      res.json({ message: 'Welcome to the Users API' });
    });
  }
}