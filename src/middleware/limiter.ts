const rateLimit = require("express-rate-limit");
const environment = process.env.NODE_ENV;

const duration = {
  //add more potential durations here.
  HOUR: 60 * 60 * 1000,
  MILLISECOND: 1
};

const STANDARD_LIMIT = {
  windowMs: environment === 'production' ?  duration.HOUR : duration.MILLISECOND,
  max: 5, // start blocking after 5 requests
  message: {
    error: "Too many requests from this IP, please try again after an hour",
  } as any,
};

export const createAccountLimiter = rateLimit(STANDARD_LIMIT);

export const loginLimiter = rateLimit(STANDARD_LIMIT);