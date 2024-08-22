const router = require("express").Router();

// Express Async Handler
const asyncHandler = require("express-async-handler");

// Argon2
const argon2 = require("argon2");

// JWT
const jwt = require("jsonwebtoken");

// Validation
const { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation, sendEmailVerificationValidation, verifyEmailValidation, sendPhoneVerificationValidation, verifyPhoneValidation } = require("../../validation/auth/Auth");

// Constants
const { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } = require("../../constants/status");
const { WALLET_ENV } = require("../../constants/wallets");

// Models
const User = require("../../models/user/User");

// Helper functions
const { sendMail, getHashedPassword, differenceFromCurrentTime, generateOTP, comparePassword, sendSMS } = require("../../helpers/helpers");

// Axios
const axios = require("axios");

// Middleware
const { verifyToken } = require("../../middleware/auth");

// Redis Cache
const { getData, setData } = require("../../cache");

// Nanoid
const { nanoid } = require("nanoid");

/**
 * @description Register new user
 * @route POST /api/auth/register
 * @access Public
 */
router.post("/register", asyncHandler(async (req, res) => {

    // Validate registration parameters
    const { error } = registerValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    const { email, password, phone, client_id, referrer } = req.body;

    // Check if user with same email or client id or phone is present
    const foundUser = await User.findOne(
        {
            $or: [
                { client_id },
                { email },
                { phone }
            ]
        }
    );
    if (foundUser) throw new Error("user with same email, client id or phone is already present");

    // Check if the email is verified from cache
    let cacheUser = await getData(email);
    if (!cacheUser?.email_verified) throw new Error("email is not verified");

    // Check if the phone is verified from cache
    let cachePhoneUser = await getData(phone);
    // if (!cachePhoneUser?.phone_verified) throw new Error("phone is not verified");

    // Referrer - Check if referrer id is correct
    let foundReferrer;
    if (referrer) {
        foundReferrer = await User.findOne({ client_id: referrer });
        if (!foundReferrer) throw new Error("referrer id/username is invalid");
    }

    // Hash password to avoid storing it in plain text
    const hashedPassword = await getHashedPassword(password);

    /**
     * Loop through all the wallet environments
     * and create an address for the user
     */
    const wallet_envs = [...Object.values(WALLET_ENV)];
    const wallet_keys = [...Object.keys(WALLET_ENV)];
    const wallets = [];

    for (const [index, wallet_env] of wallet_envs.entries()) {
        await axios
            .post(
                `${wallet_env.url}/child-addresses`,
                {
                    offset: 1
                },
                {
                    headers: {
                        Authorization: `Bearer ${wallet_env.token}`,
                        "Content-Type": "application/json"
                    }
                }
            ).then(response => {
                const data = response.data;
                console.log(data[0])

                // Push the wallet info to the wallets array
                wallets.push({
                    trading_coin: wallet_keys[index],
                    address: data[0].address
                });

            }).catch(error => {
                throw new Error(`wallet creation failed: ${error}`);
            });
    }

    // Create an user
    await User.create({
        email,
        email_verified: cacheUser.email_verified,
        password: hashedPassword,
        phone,
        phone_verified: cachePhoneUser?.phone_verified ? true : false,
        client_id,
        wallets,
        referrer: referrer ? foundReferrer._id : null
    });

    return res.status(HTTP_STATUS_CODES.CREATED)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "user registration success"
        });
}));

/**
 * @description Login user
 * @route POST /api/auth/login
 * @access Public
 */
router.post("/login", asyncHandler(async (req, res) => {

    // Validate login parameters
    const { error } = loginValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    const { password, client_id } = req.body;

    // Check if user with client id is present
    const foundUser = await User.findOne({ client_id });
    if (!foundUser) throw new Error("user with client id is not present");

    // Compare plan & hashed password
    const passwordIsCorrect = await argon2.verify(foundUser.password, password);
    if (!passwordIsCorrect) throw new Error("password is incorrect");

    // Generate bearer token for user
    const { _id, email } = foundUser;
    const token = jwt.sign(
        // Encrypted value
        {
            id: _id,
            email,
            client_id
        },
        // Secret used to encrypt the token
        process.env.JWT_SECRET,
        // Expiry for the token
        {
            expiresIn: "5d"
        }
    );

    // Store token in database for comparison
    foundUser.token = token;
    await foundUser.save();

    // Construct user object
    const user = {
        client_id,
        email: foundUser.email,
        role: foundUser.role,
        phone: foundUser.phone,
        created_at: foundUser.created_at
    }

    res.status(HTTP_STATUS_CODES.OK)
        .header("Authorization", `Bearer ${token}`)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "user login success",
            token,
            user
        });
}));

/**
 * @description Send OTP to user for password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 */
router.post("/forgot-password", asyncHandler(async (req, res) => {

    // Validate parameters
    const { error } = forgotPasswordValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    const { client_id } = req.body;

    // Check if user with client id is present
    const foundUser = await User.findOne({ client_id });
    if (!foundUser) throw new Error("user with client id is not present");

    // Generate OTP for user
    const otp = generateOTP();

    // Store token in database for comparison
    foundUser.otp = otp;
    foundUser.otp_generated_time = Date.now();
    await foundUser.save();

    // Sned OTP as an email to the user
    const email_data = {
        otp
    };
    await sendMail(
        foundUser.email,
        email_data,
        "./templates/otp-mail.html",
        "OTP - Password Reset"
    );

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "send otp success",
        });
}));

/**
 * @description Check OTP & update password
 * @route POST /api/auth/reset-password
 * @access Public
 */
router.post("/reset-password", asyncHandler(async (req, res) => {

    // Validate parameters
    const { error } = resetPasswordValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    const { client_id, password, otp } = req.body;

    // Check if user with client id is present
    const foundUser = await User.findOne({ client_id });
    if (!foundUser) throw new Error("user with client id is not present");

    // Check if otp matches with the one in DB
    const isOTPCorrect = otp === foundUser.otp;
    if (!isOTPCorrect) throw new Error("otp does not match");

    // Check if expiry time of OTP is greater than 3 minutes
    const differenceInMinutes = differenceFromCurrentTime(foundUser.otp_generated_time, "minutes");
    if (differenceInMinutes > 3) throw new Error("otp expired. please request a new otp to reset your password");

    // Check if current password and previous are same
    const isPasswordSame = await comparePassword(password, foundUser.password);
    if (isPasswordSame) throw new Error("new password cannot be same as the old password");

    // Hash password
    const hashedPassword = await getHashedPassword(password);

    // Clear otp & token from database
    foundUser.otp = "";
    foundUser.token = "";
    // Store updated password in DB
    foundUser.password = hashedPassword;
    await foundUser.save();

    // Sned reset password success confirmation as a mail to the user
    const email_data = {
        user: foundUser.email
    };
    await sendMail(
        foundUser.email,
        email_data,
        "./templates/reset-password.html",
        "Account - Password Reset Success"
    );

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "password reset success",
        });
}));

/**
 * @description Send email verification mail
 * @route POST /api/auth/send-email-verification
 * @access Public
 */
router.post("/send-email-verification", asyncHandler(async (req, res) => {

    // Validate send verification on mail parameters
    const { error } = sendEmailVerificationValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    const { email } = req.body;

    // Check if user with email is present
    const foundUser = await User.findOne({ email });
    if (foundUser) throw new Error("user is already registered");

    // Generate UUID for the verification link
    const link_id = nanoid();

    const user = {
        email,
        link_id,
        link_id_generated_time: Date.now(),
        email_verified: false
    };

    // Store user in cache
    await setData(email, user);

    // Construct veriifcation link
    const verification_link = `${process.env.EMAIL_VERIFICATION_LINK}/verify-email?email=${email}&link_id=${link_id}`;

    // Sned verification as an email to user
    const email_data = {
        verification_link
    };

    await sendMail(
        email,
        email_data,
        "./templates/email-verification-link.html",
        "Verify Your Email"
    );

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "send verification email success",
        });
}));

/**
 * @description Verify email verification link
 * @route POST /api/auth/verify-email
 * @access Public
 */
router.post("/verify-email", asyncHandler(async (req, res) => {

    // Validate email verification parameters
    const { error } = verifyEmailValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get all parameters from request body
    const { email, link_id } = req.body;

    // Get data for email from cache
    let user = await getData(email);

    // Check link from cache
    if (user?.link_id != link_id) throw new Error("verification link expired");

    // Check if expiry date / time of verification link has exceeded 5 minutes
    const differenceInMinutes = differenceFromCurrentTime(user.link_id_generated_time, "minutes");
    if (differenceInMinutes > 5) throw new Error("verification link is not valid");

    // Save user with verified tag
    user.email_verified = true;
    user.link_id = "";
    await setData(email, user);

    // Sned email verified mail to user
    const email_data = {};

    await sendMail(
        email,
        email_data,
        "./templates/email-verified.html",
        "Email Verified"
    );

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "email verification success",
        });
}));

/**
 * @description Send sms verification
 * @route POST /api/auth/send-phone-verification
 * @access Public
 */
router.post("/send-phone-verification", asyncHandler(async (req, res) => {

    // Validate send verification on sms parameters
    const { error } = sendPhoneVerificationValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    const { phone } = req.body;

    // Check if user with phone is present
    const foundUser = await User.findOne({ phone });
    if (foundUser) throw new Error("user is already registered");

    // Generate OTP for verification
    const otp = generateOTP();

    const user = {
        phone,
        otp,
        phone_otp_generated_time: Date.now(),
        phone_verified: false
    };

    // Store user in cache
    await setData(phone, user);

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
 * @description Verify sms otp verification
 * @route POST /api/auth/verify-phone
 * @access Public
 */
router.post("/verify-phone", asyncHandler(async (req, res) => {

    // Validate phone verification parameters
    const { error } = verifyPhoneValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get all parameters from request body
    const { phone, otp } = req.body;

    // Get data for email from cache
    let user = await getData(phone);

    // Check if user exists in cache
    if (!user) throw new Error("phone number is not valid");

    // Check OTP from cache
    if (user?.otp != otp) throw new Error("OTP expired");

    // Check if expiry date / time of verification OTP has exceeded 5 minutes
    const differenceInMinutes = differenceFromCurrentTime(user.phone_otp_generated_time, "minutes");
    if (differenceInMinutes > 5) throw new Error("OTP is not valid");

    // Save user with verified phone tag
    user.phone_verified = true;
    user.otp = "";
    await setData(phone, user);

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "phone verification success",
        });
}));

/**
 * @description Check if client_id is available
 * @route POST /api/auth/check-client-id
 * @access Public
 */
router.post("/check-client-id", asyncHandler(async (req, res) => {

    // Validate check username parameters
    const { error } = forgotPasswordValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get all parameters from request body
    const { client_id } = req.body;

    // Check if user will client_id is found
    const foundUser = await User.findOne({ client_id });
    if (foundUser) throw new Error("username not available")

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "username is available",
        });
}));

/**
 * @description Check user
 * @route GET /api/auth/check-user
 * @access Private
 */
router.get("/check-user", verifyToken, asyncHandler(async (req, res) => {

    res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "user authorized"
        });
}));

/**
 * @description Signout logged in user
 * @route GET /api/auth/signout
 * @access Private
 */
router.get("/signout", verifyToken, asyncHandler(async (req, res) => {

    const { id } = req.user;

    // Get user by id
    const foundUser = await User.findOne({ _id: id });

    // Empty token and save user
    foundUser.token = "";
    await foundUser.save();

    res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "signout success"
        });
}));

// Send test mail using nodemailer
router.post("/send_mail", asyncHandler(async (req, res) => {
    try {
        // let testAccount = await nodemailer.createTestAccount();

        // console.log(testAccount);
        const mailInfo = await sendMail(
            "mohan@parallax.co.in",
            {
                otp: "232343"
            },
            "./templates/otp-mail.html",
            "OTP - Password Reset"
        );

        return res.status(HTTP_STATUS_CODES.OK)
            .send({
                status: HTTP_STATUS_MESSAGES.SUCCESS,
                email_id: mailInfo.messageId
            });


    } catch (error) {
        throw new Error(error);
    }

}))

// Send test mail using nodemailer & mailgun
router.post("/send_mailgun", asyncHandler(async (req, res) => {
    try {
        const mailInfo = await sendMail(
            "mohan@parallax.co.in",
            {
                otp: "342364"
            },
            "./templates/otp-mail.html",
            "OTP - Password Reset"
        );

        return res.status(HTTP_STATUS_CODES.OK)
            .send({
                status: HTTP_STATUS_MESSAGES.SUCCESS,
                email_id: mailInfo.messageId
            });


    } catch (error) {
        throw new Error(error);
    }

}))

module.exports = router;