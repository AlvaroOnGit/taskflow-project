export function errorHandler(res, status, error, message) {
    return res.status(status).json({ error: error, message: message });
}