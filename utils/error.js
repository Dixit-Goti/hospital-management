export class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Indicates trusted/handled error
        Error.captureStackTrace(this, this.constructor);
    };
};