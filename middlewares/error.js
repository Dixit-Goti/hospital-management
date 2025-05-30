import { errorResponse } from "../utils/response.js";
import { ApiError } from "../utils/error.js";

const errorHandler = (err, req, res, next) => {
  // Handle MongoDB duplicate key errors
  if (err.name === "MongoServerError" && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value for ${field}: ${err.keyValue[field]}`;
    return errorResponse(
      res,
      new ApiError(message, 400, "DUPLICATE_KEY", err.keyValue)
    );
  }

  // Handle validation errors from express-validator
  if (err.array && typeof err.array === "function") {
    return errorResponse(res, err, 400);
  }

  // Handle known ApiError instances
  if (err instanceof ApiError) {
    return errorResponse(res, err, err.statusCode);
  }

  // Handle unexpected errors
  console.error("Unexpected Error:", err);
  return errorResponse(res, "Internal Server Error", 500);
};

export default errorHandler;
