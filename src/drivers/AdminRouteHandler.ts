import * as express from 'express';
type Router = express.Router;
import { DataStore, Mailer } from '../interfaces/interfaces';
import { UserResponseFactory } from './drivers';
import { AdminUserInteractor } from '../interactors/AdminUserInteractor';
import { MailerInteractor } from '../interactors/interactors';

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
    // User Routes
    router.get('/users', async (req, res) => {
      const responder = this.responseFactory.buildResponder(res);
      try {
        const query = req.query;
        const payload = await AdminUserInteractor.fetchUsers(
          this.dataStore,
          query
        );
        responder.sendObject({
          ...payload,
          users: payload.users.map(user => user.toPlainObject())
        });
      } catch (e) {
        responder.sendOperationError(e);
      }
    });
    router.delete('/users/:id', async (req, res) => {
      const responder = this.responseFactory.buildResponder(res);
      try {
        const id = req.params.id;
        await AdminUserInteractor.deleteUser(this.dataStore, id);
        responder.sendOperationSuccess();
      } catch (e) {
        responder.sendOperationError(e);
      }
    });

    // Mailer Routes
    router.post('/mail', async (req, res) => {
      const responder = this.responseFactory.buildResponder(res);
      try {
        const subject = req.body.subject;
        const message = req.body.message;
        const email = req.body.email;
        await MailerInteractor.sendBasicEmail(this.mailer, {
          subject,
          message,
          email
        });
        responder.sendOperationSuccess();
      } catch (e) {
        responder.sendOperationError(e);
      }
    });
    router
      .route('/mail/templates')
      .get(async (req, res) => {
        const responder = this.responseFactory.buildResponder(res);
        try {
          const templates = MailerInteractor.getTemplates();
          responder.sendObject(templates);
        } catch (e) {
          responder.sendOperationError(e);
        }
      })
      .post(async (req, res) => {
        const responder = this.responseFactory.buildResponder(res);
        try {
          const subject = req.body.subject;
          const email = req.body.email;
          const template = req.body.template.name;
          const templateVars = req.body.template.templateVariables;
          await MailerInteractor.sendTemplateEmail(
            this.mailer,
            {
              subject,
              email
            },
            template,
            templateVars
          );
          responder.sendOperationSuccess();
        } catch (e) {
          responder.sendOperationError(e);
        }
      });
  }
}
