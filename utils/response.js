// Success response
export const successResponse = (res, data = null, message = 'Operation successful', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data,
        message,
    });
};

// Error response
export const errorResponse = (res, error = 'An error occurred', statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        error,
        statusCode,
    })
};
