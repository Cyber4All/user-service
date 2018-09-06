import { ExpressDriver } from '@oriented/express';
import RouteHandler from './drivers/RouteHandler';
import AuthRouteHandler from './drivers/AuthRouteHandler';
import AdminRouteHandler from './drivers/AdminRouteHandler';
import MongoDriver from './drivers/MongoDriver';
import { SendgridDriver, BcryptDriver } from './drivers/drivers';
import { UserResponseFactory } from './drivers/UserResponseFactory';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import { enforceTokenAccess } from './middleware/jwt.config';
import { enforceAdminAccess } from './middleware/admin-access';
import * as logger from 'morgan';
import * as dotenv from 'dotenv';
import * as raven from 'raven';

dotenv.config();

let dburi;
switch (process.env.NODE_ENV) {
  case 'development':
    dburi = process.env.CLARK_DB_URI_DEV.replace(
      /<DB_PASSWORD>/g,
      process.env.CLARK_DB_PWD
    )
      .replace(/<DB_PORT>/g, process.env.CLARK_DB_PORT)
      .replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME);
    break;
  case 'production':
    dburi = process.env.CLARK_DB_URI.replace(
      /<DB_PASSWORD>/g,
      process.env.CLARK_DB_PWD
    )
      .replace(/<DB_PORT>/g, process.env.CLARK_DB_PORT)
      .replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME);
    break;
  case 'test':
    dburi = process.env.CLARK_DB_URI_TEST;
    break;
  default:
    break;
}

const dataStore = new MongoDriver(dburi);
const sendgridDriver = new SendgridDriver();
const bcryptDriver = new BcryptDriver(10);
const app = ExpressDriver.start();
const responseFactory = new UserResponseFactory();

raven
  .config(process.env.SENTRY_DSN)
  .install();

app.use(raven.requestHandler());
app.use(raven.errorHandler());

// Setup route logger
app.use(logger('dev'));

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// Set unauthenticated api routes
app.use(
  '/',
  RouteHandler.buildRouter(
    dataStore,
    bcryptDriver,
    sendgridDriver,
    responseFactory
  )
);

// Set Validation Middleware
app.use(enforceTokenAccess);
app.use((error: any, req: any, res: any, next: any) => {
  if (error.name === 'UnauthorizedError') {
    res.status(401).send('Invalid Access Token');
  }
});
// Set authenticated api routes
app.use(
  '/',
  AuthRouteHandler.buildRouter(dataStore, bcryptDriver, responseFactory)
);

// Set Admin middleware

// Set Admin Routes
app.use(enforceAdminAccess);

app.use(
  '/admin',
  AdminRouteHandler.buildRouter(dataStore, sendgridDriver, responseFactory)
);

app.set('trust proxy', true);
