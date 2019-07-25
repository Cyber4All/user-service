import * as express from 'express';
import * as request from 'request';
import { REDIRECT_ROUTES } from '../environment/routes';
import {
  login,
  register,
  CognitoGateway
} from '../interactors/AuthenticationInteractor';
import {
  MailerInteractor,
  OTACodeInteractor,
  UserInteractor
} from '../interactors/interactors';
import { DataStore, HashInterface, Mailer } from '../interfaces/interfaces';
import { ACCOUNT_ACTIONS } from '../interfaces/Mailer.defaults';
import * as UserStatsRouteHandler from '../UserStats/UserStatsRouteHandler';
import { UserResponseFactory } from './drivers';
import { mapErrorToResponseData } from '../Error';
import { reportError } from '../shared/SentryConnector';
type Router = express.Router;
const version = require('../../package.json').version;

export default class RouteHandler {
  constructor(
    private dataStore: DataStore,
    private hasher: HashInterface,
    private mailer: Mailer,
    private cognitoGateway: CognitoGateway,
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
    mailer: Mailer,
    cognitoGateway: CognitoGateway,
    responseFactory: UserResponseFactory
  ) {
    const e = new RouteHandler(
      dataStore,
      hasher,
      mailer,
      cognitoGateway,
      responseFactory
    );
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
        message: `Welcome to the Users API v${version}`
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
      "password": "string",
      organization: string
    }
    */
    // Returns either message warning invalid info, or success
    router
      .route('/users')
      .get(async (req, res) => {
        const responder = this.responseFactory.buildResponder(res);
        try {
          const query = req.query;
          const users = await UserInteractor.searchUsers(this.dataStore, query);
          responder.sendObject(users);
        } catch (e) {
          responder.sendOperationError(e);
        }
      })
      // register
      .post(async (req, res) => {
        const responder = this.responseFactory.buildResponder(res);
        const user = req.body;
        try {
          const tokens = await register(
            this.dataStore,
            this.hasher,
            user,
            this.cognitoGateway
          );

          OTACodeInteractor.generateOTACode(
            this.dataStore,
            ACCOUNT_ACTIONS.VERIFY_EMAIL,
            user.email
          )
            .then((otaCode) => {
              MailerInteractor.sendEmailVerification(
                this.mailer,
                user.email,
                otaCode
              );
            })
            .catch(e => reportError(e));

          responder.setCookie('presence', tokens.bearer);
          res.send({ ...tokens.user, tokens });
        } catch (e) {
          const { code, message } = mapErrorToResponseData(e);
          res.status(code).json({ message });
        }
      });

    // Get user information
    router.get('/users/update', async (req, res) => {
      try {
        const query = req.query.username;
        const user = await UserInteractor.loadUser(this.dataStore, query);
        this.responseFactory.buildResponder(res).sendUser(user);
      } catch (e) {
        this.responseFactory.buildResponder(res).sendOperationError(e);
      }
    });

    // Login
    router.post('/users/tokens', async (req, res) => {
      const responder = this.responseFactory.buildResponder(res);
      try {
        const token = await login(
          this.dataStore,
          this.hasher,
          req.body.username,
          req.body.password,
          this.cognitoGateway
        );
        responder.setCookie('presence', token.bearer);
        const user = token.user;
        const tokens = { bearer: token.bearer, openId: token.openId };
        res.send({ ...user, tokens });
      } catch (e) {
        const { code, message } = mapErrorToResponseData(e);
        res.status(code).json({ message });
      }
    });

    router.get('/users/:username/profile', async (req, res) => {
      const responder = this.responseFactory.buildResponder(res);
      try {
        const user = await UserInteractor.loadUser(
          this.dataStore,
          req.params.username
        );
        responder.sendUser(user);
      } catch (e) {
        responder.sendOperationError(e);
      }
    });

    router.route('/users/organizations').get(async (req, res) => {
      const responder = this.responseFactory.buildResponder(res);
      try {
        const orgs = await UserInteractor.findOrganizations(
          this.dataStore,
          req.query.query
        );
        responder.sendObject(orgs);
      } catch (e) {
        responder.sendOperationError('Invalid orgs request');
      }
    });

    router.route('/users/identifiers/active').get(async (req, res) => {
      const responder = this.responseFactory.buildResponder(res);
      try {
        const inUse = await UserInteractor.identifierInUse(
          this.dataStore,
          req.query.username
        );
        responder.sendObject(inUse);
      } catch (e) {
        responder.sendOperationError(e);
      }
    });

    router
      .route('/users/ota-codes')
      .post(async (req, res) => {
        try {
          const action = req.query.action;
          const email = req.body.email;
          const responder = this.responseFactory.buildResponder(res);
          const otaCode = await OTACodeInteractor.generateOTACode(
            this.dataStore,
            action,
            email
          );
          switch (action) {
            case ACCOUNT_ACTIONS.VERIFY_EMAIL:
              await MailerInteractor.sendEmailVerification(
                this.mailer,
                email,
                otaCode
              );
              responder.sendOperationSuccess();
              break;
            case ACCOUNT_ACTIONS.RESET_PASSWORD:
              await MailerInteractor.sendPasswordReset(
                this.mailer,
                email,
                otaCode,
                this.dataStore,
                responder
              );
              break;
            default:
              responder.sendOperationError('Invalid action');
          }
        } catch (e) {
          console.log(e);
          this.responseFactory.buildResponder(res).sendOperationError(e);
        }
      })
      .get(async (req, res) => {
        try {
          const otaCode = req.query.otaCode;
          const responder = this.responseFactory.buildResponder(res);
          const decoded = await OTACodeInteractor.decode(
            this.dataStore,
            otaCode
          );
          switch (decoded.action as ACCOUNT_ACTIONS) {
            case ACCOUNT_ACTIONS.VERIFY_EMAIL:
              const user = await UserInteractor.verifyEmail(
                this.dataStore,
                decoded.data.email
              );
              // await MailerInteractor.sendWelcomeEmail(this.mailer, user);
              responder.setCookie('presence', user['token']);
              responder.redirectTo(REDIRECT_ROUTES.VERIFY_EMAIL);
              break;
            case ACCOUNT_ACTIONS.RESET_PASSWORD:
              responder.redirectTo(REDIRECT_ROUTES.RESET_PASSWORD(otaCode));
              break;
            default:
              responder.sendOperationError('Action invalid');
              break;
          }
        } catch (e) {
          console.log(e);
          this.responseFactory.buildResponder(res).sendOperationError(e);
        }
      })
      .patch(async (req, res) => {
        const responder = this.responseFactory.buildResponder(res);
        try {
          const otaCode = req.query.otaCode;
          const payload = req.body.payload;

          const decoded = await OTACodeInteractor.applyOTACode(
            this.dataStore,
            otaCode
          );

          switch (decoded.action as ACCOUNT_ACTIONS) {
            case ACCOUNT_ACTIONS.VERIFY_EMAIL:
              break;
            case ACCOUNT_ACTIONS.RESET_PASSWORD:
              await UserInteractor.updatePassword(
                this.dataStore,
                this.hasher,
                decoded.data.email,
                payload
              );
              responder.sendOperationSuccess();
              break;
            default:
              responder.sendOperationError('Invalid action.');
              break;
          }
        } catch (e) {
          responder.sendOperationError(e);
        }
      });

    router.get('/validate-captcha', async (req, res) => {
      try {
        const response = await request.post(
          'https://www.google.com/recaptcha/api/siteverify',
          {
            qs: {
              secret: process.env.CAPTCHA_SECRET,
              response: req.query.token
            },
            json: true
          }
        );
        this.responseFactory.buildResponder(res).sendUser(response);
      } catch (e) {
        this.responseFactory
          .buildResponder(res)
          .sendOperationError(`Could not validate captcha. Error: ${e}`);
      }
    });

    router.use(
      '/users/stats',
      UserStatsRouteHandler.initialize({ dataStore: this.dataStore })
    );
  }
}
