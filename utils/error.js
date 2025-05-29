export class ApiError extends Error {
  constructor(message, statusCode, errorCode = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode; // Unique identifier for error type (e.g., "USER_NOT_FOUND")
    this.details = details; // Additional info for debugging
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  // Common error types
  static BadRequest(
    message = "Bad Request",
    errorCode = "BAD_REQUEST",
    details = null
  ) {
    return new ApiError(message, 400, errorCode, details);
  }

  static Unauthorized(
    message = "Unauthorized",
    errorCode = "UNAUTHORIZED",
    details = null
  ) {
    return new ApiError(message, 401, errorCode, details);
  }

  static NotFound(
    message = "Resource Not Found",
    errorCode = "NOT_FOUND",
    details = null
  ) {
    return new ApiError(message, 404, errorCode, details);
  }
}
