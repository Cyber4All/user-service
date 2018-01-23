import { ExpressDriver, ExpressResponder } from '@oriented/express';
import RouteHandler from './drivers/RouteHandler';
import { MongoDriver } from './drivers/MongoDriver';

const mongoDriver = new MongoDriver;
let app = ExpressDriver.start();

app.use('/', RouteHandler.buildRouter(mongoDriver));