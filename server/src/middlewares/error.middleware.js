function createErrorClass(name, status) {
    return class extends Error {
        constructor(message, errors) {
            super(message);
            this.name = name;
            this.status = status;
            this.errors = errors;
        }
    };
}

export const InternalError = createErrorClass('InternalError', 500);
export const ValidationError = createErrorClass('ValidationError', 400);
export const NotFoundError = createErrorClass('NotFoundError', 404);
export const DuplicateError = createErrorClass('DuplicateError', 409);

/**
 * Express error handling middleware
 * Processes errors and sends JSON responses
 * Logs server errors (5xx) with source file and line number
 *
 * @param {Object} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @example
 * app.use(errorHandler);
 */
export const errorHandler = (err, req, res, next) => {

    const status = err.status || 500;
    const source = extractSource(err.stack);
    const message = err.message || 'Error interno del servidor';
    const errors = err.errors || {};

    if (status >= 500) {
        console.error(message);
        console.error(`File: ${source?.file}`);
        console.error(`Line: ${source?.line}`);
        console.error(`Errors:`, errors);

        return res.status(status).json({
            message,
        });
    }

    res.status(status).json({
        message,
        errors: err.errors
    });
}

/**
 * Extracts source file information from an error stack trace
 *
 * @param {string} stack - The error stack trace string
 * @returns {Object|null} Source information object with file, line, column, fullPath properties
 *
 * @example
 * const source = extractSource(error.stack);
 * console.log(source);
 * // Output:
 * // {
 * //   file: 'auth.service.js',
 * //   line: '45',
 * //   column: '19',
 * //   fullPath: 'A:\\Projects\\app\\services\\auth.service.js'
 * // }
 */
function extractSource(stack) {
    if (!stack) return null;

    const lines = stack.split('\n');
    const callerLine = lines[1];

    let match = callerLine.match(/\s+at\s+(.+?):\d+:\d+/);

    if (!match) {
        match = callerLine.match(/\((.+?):(\d+):(\d+)\)/);
    }

    if (match) {
        const fullPath = match[1];

        const file = fullPath
            .replace(/^file:\/\//, '')
            .split(/[\\\/]/)
            .pop();

        const lineMatch = callerLine.match(/:(\d+):(\d+)/);

        return {
            file: file,
            line: lineMatch ? lineMatch[1] : null,
            column: lineMatch ? lineMatch[2] : null,
            fullPath: fullPath
        };
    }
    return null;
}