const router = require("express").Router();

// Express Async Handler
const asyncHandler = require("express-async-handler");

// Constants
const { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } = require("../../constants/status");
const { TRADE_STATUS } = require("../../constants/trade");

// Token verification middleware
const { verifyToken } = require("../../middleware/auth");

// Models
const User = require("../../models/user/User");
const Trade = require("../../models/trade/Trade");

// Validation
const { fetchProfileDetailsValidation, fetchProfileTradesValidation, fetchStatisticsValidation } = require("../../validation/profile/Profile");

// Helper functions
const { calculatePositiveAndNegativePercent, daysAgo } = require("../../helpers/helpers");
const Review = require("../../models/review/Review");

/**
 * @description Get profile details for another user
 * @route POST /api/profile/:client_id
 * @access Private
 */
router.post("/:client_id", verifyToken, asyncHandler(async (req, res) => {

    // Validate fetch profile details
    const { error } = fetchProfileDetailsValidation(req.params);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get parameters from request parameters
    const { client_id } = req.params;

    // Get user
    const foundUser = await User.findOne({ client_id });
    if (!foundUser) throw new Error("user not found");

    // Get details from found user
    const { first_name, last_name, _id: id, created_at, badges } = foundUser;

    // Calculate positive & negative feedback
    const percentages = calculatePositiveAndNegativePercent(badges);

    // Send only essential information
    const profile = {
        first_name,
        last_name,
        client_id,
        id,
        created_at: daysAgo(created_at),
        badges,
        positive_percentage: percentages.positive_percentage,
        negative_percentage: percentages.negative_percentage
    };

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            profile
        });
}));

/**
 * @description Get all the buy and sell trades with pagination
 * for another user
 * @route POST /api/profile/trades/:client_id/:page?
 * @access Private
 */
router.post("/trades/:client_id/:page?", verifyToken, asyncHandler(async (req, res) => {

    // Validate trades validation
    const { error } = fetchProfileTradesValidation(req.params);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get trade parameters from request parameters   
    const { client_id, page = 1 } = req.params;

    // Get user
    const foundUser = await User.findOne({ client_id });
    if (!foundUser) throw new Error("user not found");

    // Get all trades by user id & remaining quantity
    Trade.paginate(
        {
            remaining_quantity: {
                $gte: 0
            },
            seller_id: foundUser._id
        },
        {
            page,
            limit: 10,
            sort: "-created_at",
            // Populate the payment details
            populate: [
                {
                    path: "payment_id",
                    select: "payment_method bank_name account_number account_holder_name"
                }
            ]
        },
        function (err, result) {
            if (err) {
                throw new Error(err);
            } else {
                // Restructure to send only data which is required
                let docs = [];
                if (result.docs.length > 0) {
                    result.docs.forEach(doc => {

                        // Destructure data
                        const {
                            _id,
                            trade_type,
                            trading_coin,
                            total_quantity,
                            minimum_buy_amount,
                            maximum_buy_amount,
                            payment_id,
                            price,
                            status,
                            created_at
                        } = doc;

                        const { _id: id, email, email_verified, client_id, badges } = foundUser;

                        // Calculate postive & negative percentage
                        const percentages = calculatePositiveAndNegativePercent(badges);

                        docs.push({
                            _id,
                            trade_type,
                            trading_coin,
                            total_quantity,
                            minimum_buy_amount,
                            maximum_buy_amount,
                            seller_id: {
                                _id: id,
                                email,
                                email_verified: email_verified ? email_verified : false,
                                client_id,
                                positive_percentage: percentages.positive_percentage
                            },
                            payment_id,
                            price,
                            status,
                            created_at
                        })
                    });
                }

                result.docs = docs;

                return res.status(HTTP_STATUS_CODES.OK)
                    .send({
                        status: HTTP_STATUS_MESSAGES.SUCCESS,
                        result
                    });
            }
        });
}));

/**
 * @description Get all reviews for another user
 * with pagination
 * @route POST /api/profile/reviews/:client_id/:page?
 * @access Private
 */
router.post("/reviews/:client_id/:page?", verifyToken, asyncHandler(async (req, res) => {

    // Validate reviews validation
    const { error } = fetchProfileTradesValidation(req.params);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get trade parameters from request parameters   
    const { client_id, page = 1 } = req.params;

    // Get user
    const foundUser = await User.findOne({ client_id });
    if (!foundUser) throw new Error("user not found");

    // Get all reviews by user id
    Review.paginate(
        {
            seller_id: foundUser._id
        },
        {
            page,
            limit: 10,
            sort: "-created_at"
        },
        function (err, result) {
            if (err) {
                throw new Error(err);
            } else {
                // Restructure to send only data which is required
                let docs = [];
                if (result.docs.length > 0) {
                    result.docs.forEach(doc => {

                        // Destructure data
                        const {
                            _id,
                            comments,
                            assessment_type
                        } = doc;

                        docs.push({
                            _id,
                            buyer_id: {
                                client_id
                            },
                            comments,
                            assessment_type
                        })
                    });
                }

                result.docs = docs;

                return res.status(HTTP_STATUS_CODES.OK)
                    .send({
                        status: HTTP_STATUS_MESSAGES.SUCCESS,
                        result
                    });
            }
        });
}));

/**
 * @description Get the detail statistics for another
 * user
 * @route POST /api/profile/statistics/:client_id
 * @access Private
 */
router.post("/statistics/:client_id", verifyToken, asyncHandler(async (req, res) => {

    // Validate statistics validation
    const { error } = fetchStatisticsValidation(req.params);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get trade parameters from request parameters   
    const { client_id } = req.params;

    // Get user
    const foundUser = await User.findOne({ client_id });
    if (!foundUser) throw new Error("user not found");

    const { _id: id } = foundUser;

    // Total trades
    const total_trades = await Trade.countDocuments({
        seller_id: id
    });

    // Total reviews
    const total_reviews = await Review.countDocuments({
        seller_id: id
    });

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            total_trades,
            total_reviews
        });
}));
module.exports = router;