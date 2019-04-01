import * as Sentry from '@sentry/node';
import * as express from 'express';

const environment = process.env.NODE_ENV;

let _reportError: (e: Error) => void = _ => {};

switch (environment) {
  case 'development':
    _reportError = console.error;
    break;
  case 'production':
    // Note: The DSN is not needed for local development since we only want to report production errors
    Sentry.init({ dsn: process.env.SENTRY_DSN });
    _reportError = Sentry.captureException;
    break;
  default:
    break;
}

export const sentryRequestHandler = Sentry.Handlers.requestHandler() as express.RequestHandler;
export const sentryErrorHandler = Sentry.Handlers.errorHandler() as express.ErrorRequestHandler;
export const reportError = _reportError;
