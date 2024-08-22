const router = require("express").Router();

// Express Async Handler
const asyncHandler = require("express-async-handler");

// Constants
const { HTTP_STATUS_CODES } = require("../../constants/status");
const { TRADE_COINS } = require("../../constants/trade");
const { TRANSACTION_TYPES } = require("../../constants/transaction");

// Models
const User = require("../../models/user/User");

// Validation
const { depositCompletedWebhookValidation } = require("../../validation/webhooks/Webhooks");
const { createTransaction } = require("../transaction/Transaction");

/**
 * @description Deposit completed webhook
 * @route POST /api/webhooks/deposit-completed
 * @access Private
 */
router.post("/deposit-completed", asyncHandler(async (req, res) => {

    // Validate webhook deposit completed method
    const { error } = depositCompletedWebhookValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Loop through multiple transactions
    for (const transaction of req.body) {
        // Get transaction parameters from request parameters   
        const { type, symbol, amount, toAddress, fromAddress, txid } = transaction.data;

        // Check if user with address exists - receiver
        const foundUser = await User.findOne({
            "wallets.trading_coin": symbol,
            "wallets.address": toAddress
        });

        // Check if user with address exists - sender
        const foundSender = await User.findOne({
            "wallets.trading_coin": symbol,
            "wallets.address": fromAddress
        });

        if (foundUser) {
            // Add the amount to the user's wallet
            let wallets = foundUser.wallets;
            let walletIndex = wallets.findIndex(wallet => wallet.trading_coin == symbol);

            if (walletIndex != -1) {
                wallets[walletIndex].balance += Number(amount);
                foundUser.wallets = wallets;
                await foundUser.save();

                // Create transaction for receiver
                await createTransaction({
                    transaction_type: TRANSACTION_TYPES[type],
                    trading_coin: TRADE_COINS[symbol],
                    quantity: amount,
                    user_id: foundUser._id.toString(),
                    txn_id: txid
                });
            }
        }

        if (foundSender) {
            // Deduct amount from the sender's wallet
            let wallets = foundSender.wallets;
            let walletIndex = wallets.findIndex(wallet => wallet.trading_coin == symbol);

            if (walletIndex != -1) {
                wallets[walletIndex].balance -= Number(amount);
                foundUser.wallets = wallets;
                await foundUser.save();

                // Create transaction for receiver
                await createTransaction({
                    transaction_type: TRANSACTION_TYPES.TRANSFER,
                    trading_coin: TRADE_COINS[symbol],
                    quantity: amount,
                    user_id: foundUser._id.toString(),
                    txn_id: txid
                });
            }
        }

        console.log(symbol, toAddress)
        console.log(foundUser.client_id, foundSender);
        // console.log(type, amount, fromAddress);
    }

    console.log("------------------------------");
    return res.sendStatus(HTTP_STATUS_CODES.OK);
}));

module.exports = router;