import * as Sentry from '@sentry/node';
import * as express from 'express';

// Note: The DSN is not needed for local development since we only want to report production errors
const environment = process.env.NODE_ENV;
Sentry.init({ dsn: process.env.SENTRY_DSN });

export const sentryRequestHandler = Sentry.Handlers.requestHandler() as express.RequestHandler;
export const sentryErrorHandler = Sentry.Handlers.errorHandler() as express.ErrorRequestHandler;
export const reportError = (error: Error) => {
  switch (environment) {
    case 'development':
      console.error(error);
      break;
    case 'production':
      Sentry.captureException(error);
      break;
    default:
      break;
  }
};
