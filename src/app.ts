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

const mongoDriver = new MongoDriver();
const sendgridDriver = new SendgridDriver();
const bcryptDriver = new BcryptDriver(10);
const app = ExpressDriver.start();
const responseFactory = new UserResponseFactory();
// Setup route logger
app.use(logger('dev'));

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// Set unauthenticated api routes
app.use(
  '/',
  RouteHandler.buildRouter(
    mongoDriver,
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
  AuthRouteHandler.buildRouter(mongoDriver, bcryptDriver, responseFactory)
);

// Set Admin middleware

// Set Admin Routes
app.use(enforceAdminAccess);

app.use(
  '/admin',
  AdminRouteHandler.buildRouter(mongoDriver, sendgridDriver, responseFactory)
);

app.set('trust proxy', true);
