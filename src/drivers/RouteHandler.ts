import * as express from 'express';
type Router = express.Router;
import {
  DataStore,
  Responder,
  Mailer,
  HashInterface
} from '../interfaces/interfaces';
import {
  login,
  register,
  logout
} from '../interactors/AuthenticationInteractor';
import { UserResponseFactory, OTACodeManager } from './drivers';
import {
  UserInteractor,
  MailerInteractor,
  OTACodeInteractor
} from '../interactors/interactors';
import { ACCOUNT_ACTIONS } from '../interfaces/Mailer.defaults';
import { REDIRECT_ROUTES } from '../environment/routes';
import { User } from '@cyber4all/clark-entity';
import * as request from 'request';
const version = require('../package.json').version;

export default class RouteHandler {
  constructor(
    private dataStore: DataStore,
    private hasher: HashInterface,
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
    hasher: HashInterface,
    mailer: Mailer,
    responseFactory: UserResponseFactory
  ) {
    let e = new RouteHandler(dataStore, hasher, mailer, responseFactory);
    let router: Router = express.Router();
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
        try {
          let query = req.query;
          await UserInteractor.searchUsers(
            this.dataStore,
            this.responseFactory.buildResponder(res),
            query
          );
        } catch (e) {
          this.responseFactory.buildResponder(res).sendOperationError(e);
        }
      })
      .post(async (req, res) => {
        let user = User.instantiate(req.body);
        await register(
          this.dataStore,
          this.responseFactory.buildResponder(res),
          this.hasher,
          user
        );
        try {
          let otaCode = await OTACodeInteractor.generateOTACode(
            this.dataStore,
            ACCOUNT_ACTIONS.VERIFY_EMAIL,
            user.email
          );
          MailerInteractor.sendEmailVerification(
            this.mailer,
            user.email,
            otaCode
          );
        } catch (e) {
          console.log(e);
        }
      })
      .patch(async (req, res) => {
        await UserInteractor.editInfo(
          this.dataStore,
          this.responseFactory.buildResponder(res),
          req.user.username,
          req.body.user
        );
      });

    // Login
    router.post('/users/tokens', async (req, res) => {
      await login(
        this.dataStore,
        this.responseFactory.buildResponder(res),
        this.hasher,
        req.body.username,
        req.body.password
      );
    });

    router
      .route('/users/tokens')
      // Validate Token
      // Param: Valid token (for testing, get from users/tokens route)
      // if valid, returns OK
      // else, returns "INVALID TOKEN"
      .get(async (req, res) => {
        this.responseFactory.buildResponder(res).sendUser(req['user']);
      });

    router
      .route('/users/identifiers/active')
      .get(async (req, res) => {
        try { 
          await UserInteractor.identifierInUse(
            this.dataStore,
            this.responseFactory.buildResponder(res),
            req.query.username
          )
        }catch (e) {
          console.log(e);
          this.responseFactory.buildResponder(res).sendOperationError(e);
        }
      });

    router.delete('/users/:username/tokens', async (req, res) => {
      // TODO invalidate JWT here as well as clearing the login cookie
      logout(this.dataStore, this.responseFactory.buildResponder(res));
    });

    router
      .route('/users/ota-codes')
      .post(async (req, res) => {
        try {
          let action = req.query.action;
          let email = req.body.email;
          let responder = this.responseFactory.buildResponder(res);
          let otaCode = await OTACodeInteractor.generateOTACode(
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
                otaCode
              );
              responder.sendOperationSuccess();
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
          let otaCode = req.query.otaCode;
          let responder = this.responseFactory.buildResponder(res);
          let decoded = await OTACodeInteractor.decode(this.dataStore, otaCode);
          switch (decoded.action as ACCOUNT_ACTIONS) {
            case ACCOUNT_ACTIONS.VERIFY_EMAIL:
              let user = await UserInteractor.verifyEmail(
                this.dataStore,
                responder,
                decoded.data.email
              );
              // await MailerInteractor.sendWelcomeEmail(this.mailer, user);
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
        try {
          let otaCode = req.query.otaCode;
          let payload = req.body.payload;
          let responder = this.responseFactory.buildResponder(res);

          let decoded = await OTACodeInteractor.applyOTACode(
            this.dataStore,
            otaCode
          );

          switch (decoded.action as ACCOUNT_ACTIONS) {
            case ACCOUNT_ACTIONS.VERIFY_EMAIL:
              break;
            case ACCOUNT_ACTIONS.RESET_PASSWORD:
              await UserInteractor.updatePassword(
                this.dataStore,
                this.responseFactory.buildResponder(res),
                this.hasher,
                decoded.data.email,
                payload
              );
              break; 
            default:
              responder.sendOperationError('Invalid action.');
              break;
          }
        } catch (e) {
          this.responseFactory
            .buildResponder(res)
            .sendOperationError('Invalid OTA Code.');
        }
      });

    // TODO: Remove account
    // When implemented...
    // provide token, which is then unauthorized, and return success message
    // Need to implement promise rejection catch - error message in console on failure.
    router.delete('/users/:username', async (req, res) => {
      this.responseFactory
        .buildResponder(res)
        .sendOperationError('Cannot delete user accounts at this time');
      throw new Error('Cannot delete user accounts at this time');
    });

    router.get('/validate-captcha', async (req, res) => {
      try {
        let response = await request.post(
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

    
  }
}
