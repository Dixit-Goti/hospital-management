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
 * @param {string|ApiError} [error="An error occurred"] - Error message or ApiError instance
 * @param {number} [statusCode=500] - HTTP status code
 * @returns {Object} JSON response
 */
export const errorResponse = (
  res,
  error = "An error occurred",
  statusCode = 500
) => {
  const response = {
    success: false,
    error: error instanceof ApiError ? error.message : error,
    ...(error instanceof ApiError &&
      error.errorCode && { errorCode: error.errorCode }),
    ...(error instanceof ApiError &&
      error.details && { details: error.details }),
  };
  return res.status(statusCode).json(response);
};
