import { ApiError } from "../utils/error.js";
import winston from "winston";

// Initialize logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/auth.log" }),
  ],
});

/**
 * Middleware to restrict access based on user roles.
 * Usage: authorize('doctor') or authorize(['doctor', 'admin'])
 * @param {string|string[]} allowedRoles - Single role or array of roles
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!req.user || !roles.includes(req.user.role)) {
      logger.warn(
        `Unauthorized access attempt by ${
          req.user?.email || "unknown"
        } (role: ${req.user?.role || "none"}) - ${req.ip}`
      );
      return next(
        ApiError.Unauthorized(
          "Access denied: insufficient permissions",
          "FORBIDDEN"
        )
      );
    }
    next();
  };
};

export default authorize;
