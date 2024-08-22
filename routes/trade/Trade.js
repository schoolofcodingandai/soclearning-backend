const router = require("express").Router();

// Express Async Handler
const asyncHandler = require("express-async-handler");

// Constants
const { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } = require("../../constants/status");
const { TRADE_COINS, TRADE_TYPE } = require("../../constants/trade");

// Token verification middleware
const { verifyToken } = require("../../middleware/auth");

// Models
const PaymentMethod = require("../../models/user/PaymentMethod");
const Trade = require("../../models/trade/Trade");
const User = require("../../models/user/User");

// Validation
const { addTradeValidation, getTradesValidation } = require("../../validation/trade/Trade");
const { calculatePositiveAndNegativePercent } = require("../../helpers/helpers");

/**
 * @description Get all the user's trades using token
 * with pagination
 * @route POST /api/trade/trades/:page?
 * @access Private
 */
router.post("/trades/:page?", verifyToken, asyncHandler(async (req, res) => {
    
    // Get id from the user
    const { id } = req.user;
    
    // Get page for params
    const { page = 1 } = req.params; 

    console.log("page is: ", page)

    // Get all trades that belongs to user
    Trade.paginate(
        {
            seller_id: id
        },
        {
            page,
            limit: 10,
            // Populate the seller data and payment details
            populate: [
                {
                    path: "seller_id",
                    select: "first_name last_name email _id client_id"
                },
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
                return res.status(HTTP_STATUS_CODES.OK)
                    .send({
                        status: HTTP_STATUS_MESSAGES.SUCCESS,
                        result
                    });
            }
        });
}));

/**
 * @description Get all the buy or sell trades with pagination
 * @route POST /api/trade/trades/:trade_type/:page?
 * @access Public
 */
router.post("/trades/:trade_type/:page?", asyncHandler(async (req, res) => {

    // Validate get trade method
    const { error } = getTradesValidation(req.params);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get trade parameters from request parameters   
    const { trade_type, page = 1 } = req.params;

    // Buy sort
    let buySort = "-created_at";

    // Sell sort
    let sellSort = {
        "seller_id.partner_seller": -1,
        created_at: -1
    };

    const options = {
        page,
        limit: 10,
        sort: trade_type == TRADE_TYPE.BUY ? buySort : sellSort,
        // Populate the seller data and payment details
        // populate: [
        //     {
        //         path: "seller_id",
        //         select: "first_name last_name email _id client_id badges email_verified partner_seller"
        //     },
        //     {
        //         path: "payment_id",
        //         select: "payment_method bank_name account_number account_holder_name"
        //     }
        // ],
        defaultSort: {
            "seller_id.partner_seller": false
        }
    };

    const tradeAggregate = Trade.aggregate(
        [
            {
                '$match': {
                    'remaining_quantity': {
                        '$gte': 0
                    },
                    'trade_type': trade_type
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'seller_id',
                    'foreignField': '_id',
                    'as': 'seller_id'
                }
            }, {
                '$unwind': {
                    'path': '$seller_id',
                    'includeArrayIndex': 'string'
                }
            }, {
                '$lookup': {
                    'from': 'paymentmethods',
                    'localField': 'payment_id',
                    'foreignField': '_id',
                    'as': 'payment_id'
                }
            }, {
                '$unwind': {
                    'path': '$payment_id',
                    'includeArrayIndex': 'string'
                }
            }
        ]
    )

    // Get all trades by trade type
    Trade.aggregatePaginate(
        tradeAggregate,
        options,
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
                            seller_id,
                            payment_id,
                            price,
                            status,
                            created_at
                        } = doc;

                        const { _id: id, email, email_verified, client_id, partner_seller } = seller_id;

                        // Calculate postive & negative percentage
                        const percentages = calculatePositiveAndNegativePercent(seller_id.badges);

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
                                positive_percentage: percentages.positive_percentage,
                                partner_seller
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
 * @description Add a trade
 * @route POST /api/trade/
 * @access Private
 */
router.post("/", verifyToken, asyncHandler(async (req, res) => {

    // Validate register payment method
    const { error } = addTradeValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get payment parameters from request body   
    const { trade_type, trading_coin, price, payment_id, minimum_buy_amount, maximum_buy_amount, total_quantity } = req.body;

    // Get user id from user token
    const { id } = req.user;

    /**
     * Check if payment method is valid and
     * payment method belongs to user
     */
    const foundPaymentMethod = await PaymentMethod.findOne(
        {
            _id: payment_id,
            user_id: id
        }
    );
    if (!foundPaymentMethod) throw new Error("payment method not found");

    /**
     * Check if user has sufficient wallet balance
     */
    // Get user's wallet
    const foundUser = await User.findOne({ _id: id });

    // Get wallet of user
    let wallets = foundUser.wallets;

    const trading_coin_key = Object.keys(TRADE_COINS).find(key => TRADE_COINS[key] == trading_coin);

    let walletIndex = wallets.findIndex(wallet => wallet.trading_coin == trading_coin_key);
    console.log(wallets[walletIndex].balance);

    // Check if wallet is available for the user
    if (walletIndex == -1) throw new Error("wallet is not available");

    // Check if user has sufficient balance
    if (wallets[walletIndex].balance < Number(total_quantity)) throw new Error(`wallet doesn't have enough balance. please deposit ${trading_coin} in your wallet to continue trading`);

    /**
     * Consign quantity in wallet to prevent them from withdrawing the fund
     */
    // Sufficient balance is available then shift it to consigned quantity
    wallets[walletIndex].balance -= Number(total_quantity);
    wallets[walletIndex].consigned_balance += Number(total_quantity);

    // Save user
    foundUser.wallets = wallets;
    await foundUser.save();

    // Create trade
    await Trade.create({
        trade_type,
        trading_coin,
        price,
        seller_id: id,
        payment_id,
        total_quantity,
        minimum_buy_amount,
        maximum_buy_amount,
        remaining_quantity: total_quantity
    });

    return res.status(HTTP_STATUS_CODES.CREATED)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "trade added"
        });
}));

module.exports = router;