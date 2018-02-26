import * as express from "express";
type Router = express.Router;
import {
  DataStore,
  Responder,
  Mailer,
  HashInterface
} from "../interfaces/interfaces";
import {
  login,
  register,
  validateToken,
  logout
} from "../interactors/AuthenticationInteractor";
import { UserResponseFactory, OTACodeManager } from "./drivers";
import {
  UserInteractor,
  MailerInteractor,
  OTACodeInteractor
} from "../interactors/interactors";
import { ACCOUNT_ACTIONS } from "../interfaces/Mailer.defaults";
const version = require("../package.json").version;

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
    router.get("/users", (req, res) => {
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
      "password": "string"
    }
    */
    // Returns either message warning invalid info, or success
    router.post("/users", async (req, res) => {
      await register(
        this.dataStore,
        this.responseFactory.buildResponder(res),
        this.hasher,
        req.body
      );
    });

    // Login
    router.post("/users/tokens", async (req, res) => {
      await login(
        this.dataStore,
        this.responseFactory.buildResponder(res),
        this.hasher,
        req.body.username,
        req.body.password
      );
    });

    router
      .route("/users/:username/tokens")
      // Validate Token
      // Param: Valid token (for testing, get from users/tokens route)
      // if valid, returns OK
      // else, returns "INVALID TOKEN"
      .post(async (req, res) => {
        validateToken(this.responseFactory.buildResponder(res), req.cookies.presence);
      })

      // TODO: Logout
      // Currently throws unhandled promise rejection error, request cannot complete in postman
      .delete(async (req, res) => {
        // TODO invalidate JWT here as well as clearing the login cookie
        logout(this.dataStore, this.responseFactory.buildResponder(res));
      });

    router
      .route("/users/ota-codes")
      .post(async (req, res) => {
        try {
          let action = req.query.action;
          let payload = req.body.payload;
          let mailer = new MailerInteractor(this.mailer);
          await OTACodeInteractor.handleAction(
            this.dataStore,
            this.responseFactory.buildResponder(res),
            payload,
            mailer
          );
        } catch (e) {
          console.log(e);
          this.responseFactory.buildResponder(res).sendOperationError(e);
        }
      })
      .get(async (req, res) => {
        try {
          let otaCode = req.query.otaCode;
          await OTACodeInteractor.handleRedirect(
            this.dataStore,
            this.responseFactory.buildResponder(res),
            otaCode
          );
        } catch (e) {
          console.log(e);
          this.responseFactory.buildResponder(res).sendOperationError(e);
        }
      })
      .patch(async (req, res) => {
        try {
          let otaCode = req.query.otaCode;
          let payload = req.query.payload;

          let decoded = await OTACodeInteractor.applyOTACode(
            this.dataStore,
            otaCode
          );
          if (decoded) {
            switch (decoded.action as ACCOUNT_ACTIONS) {
              case ACCOUNT_ACTIONS.RESET_PASSWORD:
                await UserInteractor.updatePassword(
                  this.dataStore,
                  this.responseFactory.buildResponder(res),
                  this.hasher,
                  decoded.data,
                  payload
                );
                break;
              default:
                this.responseFactory
                  .buildResponder(res)
                  .sendOperationError("Invalid action.");
                break;
            }
          } else {
            this.responseFactory
              .buildResponder(res)
              .sendOperationError("Invalid OTA Code.");
          }
        } catch (e) {
          console.log(e);
        }
      });

    // TODO: Remove account
    // When implemented...
    // provide token, which is then unauthorized, and return success message
    // Need to implement promise rejection catch - error message in console on failure.
    router.delete("/users/:username", async (req, res) => {
      this.responseFactory
        .buildResponder(res)
        .sendOperationError("Cannot delete user accounts at this time");
      throw new Error("Cannot delete user accounts at this time");
    });
  }
}
