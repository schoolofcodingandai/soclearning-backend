const router = require("express").Router();

// Express Async Handler
const asyncHandler = require("express-async-handler");

// Constants
const { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES, ORDER_STATUS } = require("../../constants/status");
const { ASSESSMENT_TYPE } = require("../../constants/review");

// Token verification middleware
const { verifyToken } = require("../../middleware/auth");

// Models
const User = require("../../models/user/User");
const Order = require("../../models/order/Order");
const Review = require("../../models/review/Review");

// Validation
const { createReviewValidation, fetchReviewsValidation } = require("../../validation/review/Review");

// Mongoose
const mongoose = require("mongoose");

/**
 * @description Get all reviews for a seller with pagination
 * @route POST /api/review/reviews/:seller_id/:page
 * @access Private
 */
router.post("/reviews/:seller_id/:page?", verifyToken, asyncHandler(async (req, res) => {

    // Validate fetching reviews
    const { error } = fetchReviewsValidation(req.params);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get seller id & page number from request parameters
    const { seller_id, page = 1 } = req.params;

    // Get all reviews in pagination format
    Review.paginate(
        {
            seller_id
        },
        {
            page,
            limit: 10,
            sort: "-created_at"
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
 * @description Create a review
 * @route POST /api/review/
 * @access Private
 */
router.post("/", verifyToken, asyncHandler(async (req, res) => {

    // Validate create order
    const { error } = createReviewValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get review parameters from request body   
    const {
        order_id,
        comments,
        assessment_type,
        review
    } = req.body;

    // Get user id from user token
    const { id } = req.user;

    // Check if order exists and associated with seller & buyer
    const foundOrder = await Order.findOne({
        _id: order_id,
        buyer_id: id,
        status: ORDER_STATUS.APPROVED
    });
    if (!foundOrder) throw new Error("order not found");

    const { seller_id } = foundOrder;

    // Check if seller exists
    const foundSeller = await User.findOne({ _id: seller_id });
    if (!foundSeller) throw new Error("seller not found");

    // Check if seller is associated with the order
    if (seller_id != foundOrder.seller_id) throw new Error("order does not belong to seller");

    // Check if order is already reviewed
    if (foundOrder.review) throw new Error("order is already reviewed");

    // Create review
    const review_id = new mongoose.Types.ObjectId();
    await Review.create({
        _id: review_id,
        order_id,
        seller_id,
        buyer_id: id,
        assessment_type,
        comments,
        review
    });

    // Save review_id to order
    foundOrder.review = review_id;
    await foundOrder.save();

    // Add to total number of reviews in seller
    foundSeller.badges.total_reviews += 1;

    // Add review to good/bad review total
    assessment_type === ASSESSMENT_TYPE.GOOD ? foundSeller.badges.total_good_reviews += 1 : foundSeller.badges.total_bad_reviews += 1;

    // Save seller
    await foundSeller.save();

    return res.status(HTTP_STATUS_CODES.CREATED)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "review created for order"
        });
}));

module.exports = router;