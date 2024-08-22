// Express Async Handler
import asyncHandler from 'express-async-handler';

// Constants
import { HTTP_STATUS_CODES } from '../constants/status.js';

// JWT
import jwt from 'jsonwebtoken';

// Models
import User from '../models/user/User.js';

const verifyToken = asyncHandler(async (req, res, next) => {
    let token;

    // Request headers
    let headers = req.headers;

    /**
     * Check if the token is present in the request
     * authorization header
     */
    if (
        !headers.authorization ||
        !headers.authorization.startsWith("Bearer")
    ) {
        res.status(HTTP_STATUS_CODES.FORBIDDEN);
        throw new Error("user not authorized");
    }

    // Get token from the header
    token = headers.authorization.split(" ")[1];

    // Check if no token is present in bearer
    if (!token) {
        res.status(HTTP_STATUS_CODES.FORBIDDEN);
        throw new Error("user not authorized");
    }

    // Decode token from user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check token with DB to ensure that it is the current one
    const foundUser = await User.findOne({ _id: decoded.id });

    if (!foundUser || token != foundUser.token) {
        res.status(HTTP_STATUS_CODES.FORBIDDEN);
        throw new Error("user not authorized");
    }

    req.user = foundUser;

    next();
});

/**
 * @description Checks whether user has the role for the route
 * @param {Array} allowedRoles 
 * @returns 
 */
const authByRole = allowedRoles => {
    return function (req, res, next) {
        // Get role from user object
        const { role } = req.user;

        // Check if the role is allowed
        const isAllowedRole = allowedRoles.includes(role);

        // Restrict access if role is not found
        if (!isAllowedRole) {
            res.status(HTTP_STATUS_CODES.UNAUTHORIZED);
            throw new Error("user not authorized");
        }

        // Move forward
        next();
    }
}

export {
    verifyToken,
    authByRole
}