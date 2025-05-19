import { ApiError } from "../utils/error.js";

/**
 * Middleware to restrict access based on user roles.
 * Usage: authorize('doctor') or authorize('doctor', 'admin')
 */

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return next(new ApiError("Access denied: insufficient permissions", 403));
        }
        next();
    };
};

export default authorize;
