import { reportError } from './drivers/SentryConnector';

/**
 * The reasons for which a ServiceError may be thrown.
 */
export enum ServiceErrorReason {
  INTERNAL = 'InternalServiceError',
}

/**
 * Defines an error that the service encountered when processing a request.
 */
export class ServiceError extends Error {
  constructor(type: ServiceErrorReason) {
    super('Internal Server Error');
    this.name = type;
  }
}

/**
 * The reasons for which a ResourceError may be thrown.
 */
export enum ResourceErrorReason {
  INVALID_ACCESS = 'InvalidAccess',
  NOT_FOUND = 'NotFound',
  BAD_REQUEST = 'BadRequest',
}
/**
 * Defines an error involving a specific resource in the service.
 */
export class ResourceError extends Error {
  constructor(message: string, type: ResourceErrorReason) {
    super(message);
    this.name = type;
  }
}

/**
 * Takes an error object of any kind, and maps it to a status code and message.
 *
 * Any error that is not of type ResourceError or ServiceError will default to
 * an Internal Server Error. If a value is passed in that is not of type Error,
 * it will be reported and and processed as an Internal Server Error.
 * @param error the Error to map to HTTP information.
 * @returns information to convert an Error to a proper HTTP response.
 */
export function mapErrorToResponseData(error: Error): { code: number, message: string } {
  if (!(error instanceof Error)) {
    reportError(error);
    return { code: 500, message: 'Internal Server Error' };
  }
  const status = {
    code: 500,
    message: error.message,
  };
  switch (error.name) {
    case ResourceErrorReason.INVALID_ACCESS:
      status.code = 401;
      break;
    case ResourceErrorReason.NOT_FOUND:
      status.code = 404;
      break;
    case ServiceErrorReason.INTERNAL:
      status.code = 500;
      break;
    default:
      reportError(error);
      status.code = 500;
      status.message = 'Internal Service Error';
  }
  return status;
}
