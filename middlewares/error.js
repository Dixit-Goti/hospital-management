import { errorResponse } from '../utils/response.js';
import { ApiError } from '../utils/error.js';

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        // Handle known operational errors
        return errorResponse(res, err.message, err.statusCode);
    }

    // Handle unexpected errors
    console.error('Unexpected Error:', err);
    return errorResponse(res, 'Internal Server Error', 500);
};

export default errorHandler;