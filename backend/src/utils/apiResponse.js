/**
 * Utility functions for standardized API responses
 */

/**
 * Create a success response
 * @param {Object} data - The data to return
 * @param {String} message - Optional success message
 * @returns {Object} Standardized success response
 */
const successResponse = (data, message = 'Operation successful') => {
  return {
    success: true,
    message,
    data
  };
};

/**
 * Create an error response
 * @param {String} message - Error message
 * @param {String} code - Error code
 * @param {Number} statusCode - HTTP status code
 * @returns {Object} Standardized error response
 */
const errorResponse = (message, code = 'UNKNOWN_ERROR', statusCode = 500) => {
  return {
    success: false,
    error: {
      message,
      code
    },
    statusCode
  };
};

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {Object} data - The data to return
 * @param {String} message - Optional success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json(successResponse(data, message));
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {String} code - Error code
 * @param {Number} statusCode - HTTP status code (default: 500)
 */
const sendError = (res, message, code = 'UNKNOWN_ERROR', statusCode = 500) => {
  return res.status(statusCode).json(errorResponse(message, code, statusCode));
};

module.exports = {
  successResponse,
  errorResponse,
  sendSuccess,
  sendError
}; 