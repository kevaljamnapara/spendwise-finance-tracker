/**
 * What this file does:
 * Provides global error handling middleware for the Express server.
 * 
 * Why this logic exists:
 * To centralize error formatting. Instead of writing try/catch blocks that return res.status(500).json(...) 
 * in every controller, we just call next(error) and this middleware catches it and formats it consistently.
 */

/**
 * Input: The error object, request, response, and next function.
 * Output: A JSON response containing the error message (and stack trace if not in production).
 * Flow: Sets the status code based on what triggered the error, and returns a formatted JSON.
 */
export const errorHandler = (err, req, res, _next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: process.env.NODE_ENV === 'production' ? [] : [err.stack],
  });
};

/**
 * Input: Unmatched route request.
 * Output: Creates a 404 error and passes it to the errorHandler.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
