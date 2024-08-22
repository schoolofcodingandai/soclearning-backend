const router = require("express").Router();

// Express Async Handler
const asyncHandler = require("express-async-handler");

// Constants
const { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES, ORDER_STATUS } = require("../../constants/status");
const { TRADE_STATUS } = require("../../constants/trade");

// Token verification middleware
const { verifyToken } = require("../../middleware/auth");

// Models
const User = require("../../models/user/User");
const Order = require("../../models/order/Order");
const Trade = require("../../models/trade/Trade");

// Validation
const { createOrderValidation, approveOrderValidation } = require("../../validation/order/Order");

// Helper functions
const { convertToCurrencyFormat } = require("../../helpers/helpers");

/**
 * @description Get all orders by status for logged in user with pagination
 * @route POST /api/order/:status/:page?
 * @access Private
 */
router.post("/:status/:page?", verifyToken, asyncHandler(async (req, res) => {

    // Get id from the user
    const { id } = req.user;

    // Get status from request parameters
    const { status, page = 1 } = req.params;

    // Get all orders in pagination format
    Order.paginate(
        {
            $or: [
                { seller_id: id },
                { buyer_id: id }
            ],
            status
        },
        {
            page,
            limit: 10,
            sort: "-created_at",
            populate: [
                {
                    path: "trade_id",
                    select: "trading_coin",
                    populate: {
                        path: "payment_id",
                        select: "payment_method"
                    }
                }
            ]
        },
        function (err, result) {
            if (err) {
                throw new Error("error fetching orders")
            } else {
                // Destructure results
                const { docs } = result;
                let newDocs = [];

                // Check docs length
                if (docs.length > 0) {
                    docs.forEach(doc => {
                        const {
                            _id,
                            trade_id,
                            quantity,
                            buyer_id,
                            seller_id,
                            price,
                            total_amount,
                            deposited_amount,
                            status,
                            created_at,
                            updated_at,
                            review
                        } = doc;

                        // Provide a flag for the frontend if this is the user's trade
                        const is_mine = seller_id == id;

                        newDocs.push({
                            _id,
                            trade_id,
                            quantity,
                            buyer_id,
                            seller_id,
                            is_mine,
                            price,
                            total_amount,
                            deposited_amount,
                            status,
                            created_at,
                            updated_at,
                            review
                        });
                    });
                }

                // Replace old docs with the new one
                result.docs = newDocs;

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
 * @description Create an order
 * @route POST /api/order/
 * @access Private
 */
router.post("/", verifyToken, asyncHandler(async (req, res) => {

    // Validate create order
    const { error } = createOrderValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get order parameters from request body   
    const {
        trade_id,
        seller_id,
        quantity,
        depositor_name,
        deposited_amount
    } = req.body;

    // Get user id from user token
    const { id } = req.user;

    // Check if seller exists
    const foundSeller = await User.findOne({ _id: seller_id });
    if (!foundSeller) throw new Error("seller not found");

    // Check if trade exists
    const foundTrade = await Trade.findOne({ _id: trade_id });
    if (!foundTrade) throw new Error("trade not found");

    const { price, minimum_buy_amount, maximum_buy_amount, remaining_quantity } = foundTrade;

    // Check if trade is associated with the seller
    if (foundTrade.seller_id != seller_id) throw new Error("trade doesn't belong to seller");

    // Check if quantity is remaining
    if (foundTrade.remaining_quantity < quantity) throw new Error("quantity not available");

    // Check if the order adheres to minimum & maximum amount
    const total_amount = price * quantity;

    if (minimum_buy_amount > total_amount || minimum_buy_amount > deposited_amount) throw new Error(`minium buy amount for this trade is ${convertToCurrencyFormat(minimum_buy_amount)}`);

    if (maximum_buy_amount < total_amount || maximum_buy_amount < deposited_amount) throw new Error(`maximum buy amount for this trade is ${convertToCurrencyFormat(maximum_buy_amount)}`);

    console.log(Math.ceil(total_amount));
    // Check if deposited amount is equal to total amount
    if (Math.ceil(total_amount) != deposited_amount) throw new Error(`deposited amount should be ${convertToCurrencyFormat(total_amount)}`);

    // Create new payment method
    await Order.create({
        trade_id,
        buyer_id: id,
        seller_id,
        quantity,
        price,
        total_amount,
        depositor_name,
        deposited_amount
    });

    // Deduct quantity from trade
    foundTrade.remaining_quantity -= quantity;

    // Change trade status if remaining quantity is 0
    if (foundTrade.remaining_quantity <= 0) {
        foundTrade.status = TRADE_STATUS.COMPLETED;
    }

    // Save updated trade
    await foundTrade.save();

    return res.status(HTTP_STATUS_CODES.CREATED)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "order created"
        });
}));

/**
 * @description Approve an order
 * @route POST /api/order/approve/:order_id
 * @access Private
 */
router.post("/approve/:order_id", verifyToken, asyncHandler(async (req, res) => {

    // Validate approve order
    const { error } = approveOrderValidation(req.params);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get order id from request parameters
    const { order_id } = req.params;
    // Get user id from user token
    const { id } = req.user;

    // Check if order exists
    const foundOrder = await Order.findOne({ _id: order_id, status: ORDER_STATUS.CREATED });
    if (!foundOrder) throw new Error("order not found");

    // Check if the person approving the order is the seller
    if (foundOrder.seller_id != id) throw new Error("order cannot be approved");

    // TODO: Send coin from seller wallet to buyer wallet
    /**
     * TODO: Create a send transfer transaction for the seller
     * and a received transfer transaction for the buyer 
     */

    /**
     * TODO: Deduct amount from the seller's wallet & add
     * amount/coin to the buyer's wallet
     */

    // Change status of order to completed
    foundOrder.status = ORDER_STATUS.APPROVED;
    await foundOrder.save();

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "order approved"
        });
}));

module.exports = router;