import { ExpressDriver, ExpressResponder } from '@oriented/express';
import RouteHandler from './drivers/RouteHandler';
import MongoDriver from './drivers/MongoDriver';
import { UserResponseFactory } from './drivers/UserResponseFactory';

const mongoDriver = new MongoDriver;
let app = ExpressDriver.start();
const responseFactory = new UserResponseFactory();

app.use('/', RouteHandler.buildRouter(mongoDriver, responseFactory));

app.set('trust proxy', true);