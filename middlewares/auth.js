import jwt from "jsonwebtoken";
import { ApiError } from "../utils/error.js";

/**
 * Middleware to authenticate incoming requests using JWT.
 * Expects the token in the 'Authorization' header as: Bearer <token>
 */
const authenticate = (req, res, next) => {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];

  // Check if Authorization header is present and starts with Bearer
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    console.log(
      `Authentication failed: Missing or malformed Authorization header - ${req.ip}`
    );
    return next(
      ApiError.Unauthorized(
        "Authorization token missing or malformed",
        "INVALID_TOKEN"
      )
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info (id, email, role)
    console.log(
      `Authenticated user: ${decoded.email} (${decoded.role}) - ${req.ip}`
    );
    next();
  } catch (err) {
    const errorMessage =
      err.name === "TokenExpiredError" ? "Token has expired" : "Invalid token";
    console.log(`Authentication failed: ${errorMessage} - ${req.ip}`);
    return next(
      ApiError.Unauthorized(
        errorMessage,
        err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN"
      )
    );
  }
};

export default authenticate;
