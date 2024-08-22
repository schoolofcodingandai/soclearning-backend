const router = require("express").Router();

// Express Async Handler
const asyncHandler = require("express-async-handler");

// Constants
const { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES, ORDER_STATUS } = require("../../constants/status");
const { TRADE_STATUS } = require("../../constants/trade");
const { ROLES } = require("../../constants/roles");

// Token verification middleware
const { verifyToken, authByRole } = require("../../middleware/auth");

// Models
const User = require("../../models/user/User");
const Order = require("../../models/order/Order");
const Trade = require("../../models/trade/Trade");

// Helper functions
const { convertToCurrencyFormat } = require("../../helpers/helpers");
const { searchUserValidation, partnerSellerValidation } = require("../../validation/admin/Admin");

/**
 * @description Get all users by pagination for admin
 * @route POST /api/admin/users/:page
 * @access Private
 */
router.post("/users/:page?", verifyToken, authByRole([ROLES.ADMIN]), asyncHandler(async (req, res) => {

    // Get page number from request parameters
    const { page = 1 } = req.params;

    // Get all users in pagination format
    User.paginate(
        {},
        {
            page,
            limit: 10,
            sort: "-created_at",
            select: '_id first_name last_name email email_verified phone phone_verified client_id partner_seller created_at'
        },
        function (err, result) {
            if (err) {
                throw new Error("error fetching users")
            } else {

                return res.status(HTTP_STATUS_CODES.OK)
                    .send({
                        status: HTTP_STATUS_MESSAGES.SUCCESS,
                        result
                    });
            }
        }
    )
}));

/**
 * @description Search users with pagination for admin
 * @route POST /api/admin/users/search/:keyword/:page?
 * @access Private
 */
router.post("/users/search/:keyword/:page?", verifyToken, authByRole([ROLES.ADMIN]), asyncHandler(async (req, res) => {

    // Validate search user method
    const { error } = searchUserValidation(req.params);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get user search parameters from request parameters   
    const { keyword, page = 1 } = req.params;

    // Query with regex to search the user - case insensitive
    const query = {
        $or: [
            {
                client_id: {
                    $regex: keyword,
                    $options: "i"
                },
            },
            {
                email: {
                    $regex: keyword,
                    $options: "i"
                }
            }
        ]
    };

    // Saerch users in pagination format
    User.paginate(
        query,
        {
            page,
            limit: 10,
            sort: "-created_at",
            select: '_id first_name last_name email email_verified phone phone_verified client_id partner_seller created_at'
        },
        function (err, result) {
            if (err) {
                throw new Error("error fetching users")
            } else {

                return res.status(HTTP_STATUS_CODES.OK)
                    .send({
                        status: HTTP_STATUS_MESSAGES.SUCCESS,
                        result
                    });
            }
        }
    )
}));

/**
 * @description Get all assets of all users by pagination for admin
 * @route POST /api/admin/assets/:page
 * @access Private
 */
router.post("/assets/:page?", verifyToken, authByRole([ROLES.ADMIN]), asyncHandler(async (req, res) => {

    // Get page number from request parameters
    const { page = 1 } = req.params;

    // Get all users in pagination format
    User.paginate(
        {},
        {
            page,
            limit: 10,
            sort: "-created_at",
            select: '_id client_id email wallets'
        },
        function (err, result) {
            if (err) {
                throw new Error("error fetching assets")
            } else {

                return res.status(HTTP_STATUS_CODES.OK)
                    .send({
                        status: HTTP_STATUS_MESSAGES.SUCCESS,
                        result
                    });
            }
        }
    )
}));

/**
 * @description Get all orders by pagination for admin
 * @route POST /api/admin/orders/:page
 * @access Private
 */
router.post("/orders/:page?", verifyToken, authByRole([ROLES.ADMIN]), asyncHandler(async (req, res) => {

    // Get page number from request parameters
    const { page = 1 } = req.params;

    // Get all orders in pagination format
    Order.paginate(
        {},
        {
            page,
            limit: 10,
            sort: "-created_at",
            select: '_id price created_at'
        },
        function (err, result) {
            if (err) {
                throw new Error("error fetching orders")
            } else {

                return res.status(HTTP_STATUS_CODES.OK)
                    .send({
                        status: HTTP_STATUS_MESSAGES.SUCCESS,
                        result
                    });
            }
        }
    )
}));

/**
 * @description Get all trades by pagination for admin
 * @route POST /api/admin/trades/:page
 * @access Private
 */
router.post("/trades/:page?", verifyToken, authByRole([ROLES.ADMIN]), asyncHandler(async (req, res) => {

    // Get page number from request parameters
    const { page = 1 } = req.params;

    // Get all trades in pagination format
    Trade.paginate(
        {},
        {
            page,
            limit: 10,
            sort: "-created_at",
            select: '_id seller_id trade_type trading_coin status price total_quantity created_at',
            populate: [
                {
                    path: "seller_id",
                    select: "_id email"
                }
            ]
        },
        function (err, result) {
            if (err) {
                throw new Error("error fetching trades")
            } else {

                return res.status(HTTP_STATUS_CODES.OK)
                    .send({
                        status: HTTP_STATUS_MESSAGES.SUCCESS,
                        result
                    });
            }
        }
    )
}));

/**
 * @description Add/Remove partner seller
 * @route POST /api/admin/user/partner
 * @access Private
 */
router.post("/user/partner", verifyToken, authByRole([ROLES.ADMIN]), asyncHandler(async (req, res) => {

    // Validate partner seller fields
    const { error } = partnerSellerValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get request parameters
    const { id, partner } = req.body;

    // Update user
    await User.updateOne(
        {
            _id: id
        },
        {
            partner_seller: partner
        }
    );

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: `partner ${partner ? "added" : "removed"}`
        });
}));

module.exports = router;