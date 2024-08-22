const router = require("express").Router();

// Express Async Handler
const asyncHandler = require("express-async-handler");

// Constants
const { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } = require("../../constants/status");

// Token verification middleware
const { verifyToken } = require("../../middleware/auth");

// Models
const Transaction = require("../../models/transaction/Transaction");

// Validation
const { createTransactionValidation, getTransactionsValidation, getAllTransactionsValidation } = require("../../validation/transaction/Transaction");

/**
 * @description Get all the transactions by trading coin
 * @route POST /api/transaction/transactions/:trading_coin
 * @access Private
 */
router.post("/transactions/:trading_coin", verifyToken, asyncHandler(async (req, res) => {

    // Validate get transactions method
    const { error } = getAllTransactionsValidation(req.params);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get transaction parameters from request parameters   
    const { trading_coin } = req.params;

    // Get id from user object
    const { id } = req.user;

    // Get all transactions by trading_coin for user
    Transaction.paginate(
        {
            trading_coin,
            user: id
        },
        {
            page: 1,
            limit: 10,
            sort: "-created_at"
        },
        function (err, result) {
            if (err) {
                throw new Error(err);
            } else {
                return res.status(HTTP_STATUS_CODES.OK)
                    .send({
                        status: HTTP_STATUS_MESSAGES.SUCCESS,
                        result
                    });
            }
        });
}));

/**
 * @description Get all the transactions by type and trading coin
 * @route POST /api/transaction/transactions/:transaction_type/:trading_coin
 * @access Private
 */
router.post("/transactions/:transaction_type/:trading_coin", verifyToken, asyncHandler(async (req, res) => {

    // Validate get transactions method
    const { error } = getTransactionsValidation(req.params);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get transaction parameters from request parameters   
    const { transaction_type, trading_coin } = req.params;

    // Get id from user object
    const { id } = req.user;

    // Get all transactions by transaction_type & trading_coin for user
    Transaction.paginate(
        {
            transaction_type,
            trading_coin,
            user: id
        },
        {
            page: 1,
            limit: 10,
            sort: "-created_at"
        },
        function (err, result) {
            if (err) {
                throw new Error(err);
            } else {
                return res.status(HTTP_STATUS_CODES.OK)
                    .send({
                        status: HTTP_STATUS_MESSAGES.SUCCESS,
                        result
                    });
            }
        });
}));

/**
 * @description Create a transaction
 * @route POST /api/transaction/
 * @access Private
 */
router.post("/", verifyToken, asyncHandler(async (req, res) => {
    // Validate transaction validation
    const { error } = createTransactionValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get payment parameters from request body   
    const { transaction_type, trading_coin, quantity } = req.body;

    // Get user id from user token
    const { id } = req.user;

    /**
     * TODO: Do wallet transaction functions here
     * like deposit, transfer, etc.
     */

    // Create transaction
    await Transaction.create({
        transaction_type,
        trading_coin,
        quantity,
        user: id
    });

    return res.status(HTTP_STATUS_CODES.CREATED)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "transaction added"
        });
}));

/**
 * @description Create a transaction function
 */
async function createTransaction(data) {
    // Validate transaction validation
    const { error } = createTransactionValidation(data);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get payment parameters from passed data
    const { transaction_type, trading_coin, quantity, user_id, txn_id } = data;

    // Create transaction
    await Transaction.create({
        transaction_type,
        trading_coin,
        quantity,
        user: user_id,
        txn_id
    });

    return true;
}

module.exports = { router, createTransaction };