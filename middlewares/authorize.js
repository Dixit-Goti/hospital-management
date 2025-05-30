import { ApiError } from "../utils/error.js";

/**
 * Middleware to restrict access based on user roles.
 * Usage: authorize('doctor') or authorize(['doctor', 'admin'])
 * @param {string|string[]} allowedRoles - Single role or array of roles
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!req.user || !roles.includes(req.user.role)) {
      console.log(
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
