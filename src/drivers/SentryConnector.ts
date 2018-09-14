import * as raven from 'raven';

export const reportError = (error: Error) => {
  raven.captureException(error);
};
