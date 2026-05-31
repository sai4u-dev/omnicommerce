import { log } from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
  // Log method + URL dynamically
  log(`API ${req.method} ${req.originalUrl} called`);
  next();
};
