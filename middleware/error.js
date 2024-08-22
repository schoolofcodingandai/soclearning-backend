import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from "../constants/status.js";

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

    return res.status(statusCode)
        .send({
            status: HTTP_STATUS_MESSAGES.ERROR,
            message: err.message
        });
}

export { errorHandler };