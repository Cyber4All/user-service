import { ExpressDriver, ExpressResponder } from '@oriented/express';
import RouteHandler from './drivers/RouteHandler';
import MongoDriver from './drivers/MongoDriver';
import { SendgridDriver, BcryptDriver } from './drivers/drivers';
import { UserResponseFactory } from './drivers/UserResponseFactory';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';

const mongoDriver = new MongoDriver();
const sendgridDriver = new SendgridDriver();
const bcryptDriver = new BcryptDriver(10);
const app = ExpressDriver.start();
const responseFactory = new UserResponseFactory();

app.use(cors({ origin:true, credentials: true }));
app.use(cookieParser());
app.use('/', RouteHandler.buildRouter(mongoDriver, bcryptDriver, sendgridDriver, responseFactory));

app.set('trust proxy', true);
