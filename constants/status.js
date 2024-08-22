/**
 * @description Status when different resources are accessed
 */
const HTTP_STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

/**
 * @description Status for different response types
 */
const HTTP_STATUS_MESSAGES = {
    SUCCESS: "success",
    ERROR: "error"
};

/**
 * @description Order Status
 */
const ORDER_STATUS = {
    CREATED: 0,
    APPROVED: 1,
    REJECTED: 2
};

/**
 * @description School registration status
 */
const SCHOOL_REGISTRATION_STATUS = {
    CREATED: 'C',
    ACCEPTED: 'A',
    REJECTED: 'R',
    CLOSED: 'D'
};

export { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES, ORDER_STATUS, SCHOOL_REGISTRATION_STATUS }