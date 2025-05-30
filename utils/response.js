import { ApiError } from "./error.js";

/**
 * Sends a standardized success response
 * @param {Object} res - Express response object
 * @param {any} [data=null] - Response data
 * @param {string} [message="Operation successful"] - Success message
 * @param {number} [statusCode=200] - HTTP status code
 * @returns {Object} JSON response
 */
export const successResponse = (
  res,
  data = null,
  message = "Operation successful",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

/**
 * Sends a standardized error response
 * @param {Object} res - Express response object
 * @param {string|ApiError|Object} [error="An error occurred"] - Error message, ApiError instance, or validation errors
 * @param {number} [statusCode=500] - HTTP status code
 * @returns {Object} JSON response
 */
export const errorResponse = (
  res,
  error = "An error occurred",
  statusCode = 500
) => {
  // Handle express-validator errors
  if (error.array && typeof error.array === "function") {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: error.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }

  // Handle ApiError instances
  if (error instanceof ApiError) {
    const response = {
      success: false,
      error: error.message,
      ...(error.errorCode && { errorCode: error.errorCode }),
      ...(error.details && { details: error.details }),
    };
    return res.status(error.statusCode).json(response);
  }

  // Handle other errors (e.g., MongoDB duplication errors)
  const response = {
    success: false,
    error: error.message || error,
  };
  return res.status(statusCode).json(response);
};
