import jwt from "jsonwebtoken";
import { ApiError } from '../utils/error.js';

/**
 * Middleware to authenticate incoming requests using JWT.
 * It expects the token to be sent in the 'Authorization' header as: Bearer <token>
 */

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if Authorization header is present and starts with Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ApiError('Authoriztion token missing or malformed', 401));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request object
        req.user = decoded;
        next();
    } catch (err) {
        return next(new ApiError('Invalid or expired token', 401));
    }
}

export default authenticate;