import { ExpressDriver, ExpressResponder } from '@oriented/express';
import RouteHandler from './drivers/RouteHandler';
import MongoDriver from './drivers/MongoDriver';
import { SendgridDriver, BcryptDriver } from './drivers/drivers';
import { UserResponseFactory } from './drivers/UserResponseFactory';

const mongoDriver = new MongoDriver();
const sendgridDriver = new SendgridDriver();
const bcryptDriver = new BcryptDriver(10);
const app = ExpressDriver.start();
const responseFactory = new UserResponseFactory();

app.use('/', RouteHandler.buildRouter(mongoDriver, bcryptDriver, sendgridDriver, responseFactory));

app.set('trust proxy', true);
