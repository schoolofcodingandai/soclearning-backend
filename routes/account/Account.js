const router = require("express").Router();

// Express Async Handler
const asyncHandler = require("express-async-handler");

// Mongoose
const mongoose = require("mongoose");

// Constants
const { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } = require("../../constants/status");
const { TRADE_STATUS } = require("../../constants/trade");

// Token verification middleware
const { verifyToken } = require("../../middleware/auth");

// Models
const PaymentMethod = require("../../models/user/PaymentMethod");
const User = require("../../models/user/User");
const Trade = require("../../models/trade/Trade");

// Validation
const { registerPaymentMethod, deletePaymentMethod, changePasswordValidation } = require("../../validation/account/Account");
const { sendPhoneVerificationValidation, verifyPhoneValidation } = require("../../validation/auth/Auth");

// Helper functions
const { removeItemFromArray, calculatePositiveAndNegativePercent, comparePassword, getHashedPassword, generateOTP, differenceFromCurrentTime, sendSMS } = require("../../helpers/helpers");

// Redis Cache
const { setData, deleteData, getData } = require("../../cache");

/**
 * @description Get account details
 * @route GET /api/account
 * @access Private
 */
router.get("/", verifyToken, asyncHandler(async (req, res) => {

    // Get id from the user 
    const {
        id,
        email,
        first_name,
        last_name,
        client_id,
        phone,
        created_at,
        updated_at,
        badges,
        wallets
    } = req.user;

    // Get user
    const foundUser = await User.findOne({ _id: id }).populate("payment_methods");

    // Calculate positive & negative feedback
    const percentages = calculatePositiveAndNegativePercent(badges);

    // Send only essential information
    const account = {
        first_name,
        last_name,
        client_id,
        id,
        email,
        phone,
        created_at,
        updated_at,
        positive_percentage: percentages.positive_percentage,
        negative_percentage: percentages.negative_percentage,
        payment_methods: foundUser.payment_methods,
        wallets
    };

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            account
        });
}));

/**
 * @description Register payment method
 * @route POST /api/account/register-payment
 * @access Private
 */
router.post("/register-payment", verifyToken, asyncHandler(async (req, res) => {

    // Validate register payment method
    const { error } = registerPaymentMethod(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get payment parameters from request body   
    const { bank_name, account_number, account_holder_name } = req.body;

    // Get user id from user token
    const { id } = req.user;

    // Create new payment method
    const payment_id = new mongoose.Types.ObjectId();

    await PaymentMethod.create({
        _id: payment_id,
        user_id: id,
        bank_name,
        account_number,
        account_holder_name
    });

    // Add payment method id to user's payment methods
    const foundUser = await User.findOne({ _id: id });
    let paymentMethods = foundUser.payment_methods;
    paymentMethods.push(payment_id);
    foundUser.payment_methods = paymentMethods;
    await foundUser.save();

    // Construct payment method for sending to user
    const payment_method = {
        _id: payment_id,
        bank_name,
        account_number,
        account_holder_name
    };

    return res.status(HTTP_STATUS_CODES.CREATED)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "payment method registered",
            payment_method
        });
}));

/**
 * @description Delete payment method
 * @route DELETE /api/account/payment-method/:id
 * @access Private
 */
router.delete("/payment-method/:payment_id", verifyToken, asyncHandler(async (req, res) => {

    // Validate delete payment method
    const { error } = deletePaymentMethod(req.params);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get payment id from request parameters   
    const { payment_id } = req.params;

    // Get user id from user token
    const { id } = req.user;

    // Check if payment method is found
    const foundPaymentMethod = await PaymentMethod.findOne({ _id: payment_id });
    if (!foundPaymentMethod) throw new Error("payment method not found");

    // Check if payment method belongs to user
    if (foundPaymentMethod.user_id != id) {
        res.status(HTTP_STATUS_CODES.UNAUTHORIZED);
        throw new Error("unauthorized access");
    }

    // Check if payment method is used in any current trade
    const foundTrade = await Trade.findOne({
        seller_id: id,
        payment_id,
        remaining_quantity: { $gt: 0 },
        status: TRADE_STATUS.CREATED
    });
    if (foundTrade) throw new Error("payment method is currently used in a trade");

    // Delete payment method
    await PaymentMethod.deleteOne({ _id: payment_id });

    // Remove payment id from user's payment methods
    const foundUser = await User.findOne({ _id: id });
    let paymentMethods = foundUser.payment_methods;
    const modifiedPaymentMethods = removeItemFromArray(paymentMethods, payment_id);
    foundUser.payment_methods = modifiedPaymentMethods;
    await foundUser.save();

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "payment method deleted"
        });
}));

/**
 * @description Change password for logged in user
 * @route POST /api/account/change-password
 * @access Private
 */
router.post("/change-password", verifyToken, asyncHandler(async (req, res) => {

    // Validate password parameters
    const { error } = changePasswordValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get password parameters from request body   
    const { current_password, new_password, confirm_new_password } = req.body;

    // Get user id & hashed password from user token
    const { id, password: hashed_password } = req.user;

    // Check if current password is valid
    const isPasswordSame = await comparePassword(current_password, hashed_password);
    if (!isPasswordSame) throw new Error("current password is not correct");

    // Check if current password and new password is same
    if (current_password == new_password) throw new Error("new password cannot be same as your old password");

    // Check if new password and confirm password is same
    if (new_password != confirm_new_password) throw new Error("new password and confirm password is not same");

    // Hash password
    const newHashedPassword = await getHashedPassword(new_password);

    // Change password to new password
    const foundUser = await User.findOne({ _id: id });
    foundUser.password = newHashedPassword;
    await foundUser.save();

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "change password success"
        });
}));

/**
 * @description Send SMS verification for logged in user
 * @route POST /api/account/send-phone-verification
 * @access Private
 */
router.post("/send-phone-verification", verifyToken, asyncHandler(async (req, res) => {

    // Validate send verification on sms parameters
    const { error } = sendPhoneVerificationValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    const { phone } = req.body;

    console.log(phone.length);
    const { id } = req.user;

    // Check if user with phone is present
    const foundUser = await User.findOne({ phone });
    if (foundUser) throw new Error("phone number is already linked to another account");

    // Generate OTP for verification
    const otp = generateOTP();

    const user = {
        phone,
        otp,
        phone_otp_generated_time: Date.now(),
        phone_verified: false
    };

    // Store user in cache
    await setData(id, user);

    // Sned verification SMS to user
    sendSMS(phone, `Your OTP for verifying your P2P account is ${otp}. Please do not share this code with anyone.`);

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "send verification sms success",
            otp: process.env.NODE_ENV != "production" ? otp : ""
        });
}));

/**
 * @description Verify sms otp verification for logged
 * in user
 * @route POST /api/account/verify-phone
 * @access Private
 */
router.post("/verify-phone", verifyToken, asyncHandler(async (req, res) => {

    // Validate phone verification parameters
    const { error } = verifyPhoneValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get all parameters from request body
    const { phone, otp } = req.body;

    // Get parameters from user
    const { id } = req.user;

    // Get data for user from cache
    let user = await getData(id);

    // Check if user exists in cache
    if (!user) throw new Error("phone number is not valid");

    // Check OTP from cache
    if (user?.otp != otp) throw new Error("OTP expired");

    // Check if expiry date / time of verification OTP has exceeded 5 minutes
    const differenceInMinutes = differenceFromCurrentTime(user.phone_otp_generated_time, "minutes");
    if (differenceInMinutes > 5) throw new Error("OTP is not valid");

    // Delete user from cache
    await deleteData(id);

    // Find user and save phone number with verified tag
    const foundUser = await User.findOne({ _id: id });
    foundUser.phone = phone;
    foundUser.phone_verified = true;
    await foundUser.save();

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "phone verification success",
        });
}));

module.exports = router;