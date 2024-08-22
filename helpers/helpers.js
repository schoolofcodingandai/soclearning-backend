// Node mailer
import nodemailer from "nodemailer";

// Message Bird
// const messagebird = require("messagebird").initClient(process.env.MESSAGE_BIRD_KEY);

// Mustache
import mustache from "mustache";

// File system
import fs from "fs";

// Argon2
import argon2 from "argon2";

// JWT
import jwt from "jsonwebtoken";

// Crypto
import crypto from "crypto";

// DayJS & Relative Time
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
// const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

/**
 * @description Send Mail using nodemailer helper function
 * @param {String} receiver 
 * @param {Object} data 
 * @param {String} template_path 
 * @param {String} subject 
 * @returns {Object}
 */
const sendMailNodemailer = async (receiver, data, template_path, subject) => {
    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PASSWORD
        }
    });

    const template = fs.readFileSync(template_path, "utf-8");

    const html = mustache.render(template, data);

    let info = await transporter.sendMail({
        to: receiver,
        from: `"SoC Learning" <${process.env.MAIL_ID}>`,
        subject,
        html
    })

    console.log(`Email send id: ${info.messageId}`);

    return info;
}

/**
 * @description Send Mail using MailGun helper function
 * @param {String} receiver 
 * @param {Object} data 
 * @param {String} template_path 
 * @param {String} subject 
 * @returns {Object}
 */
const sendMail = async (receiver, data, template_path, subject) => {
    let transporter = nodemailer.createTransport({
        host: process.env.MAILGUN_SMTP_HOST,
        port: process.env.MAILGUN_SMTP_PORT,
        auth: {
            user: `postmaster@${process.env.MAILGUN_DOMAIN}`,
            pass: process.env.MAILGUN_SMTP_PASSWORD
        }
    });

    const template = fs.readFileSync(template_path, "utf-8");

    const html = mustache.render(template, data);

    let info = await transporter.sendMail({
        to: receiver,
        from: `"P2P Platform" <${process.env.MAIL_ID}>`,
        subject,
        html
    })

    console.log(`Email send id: ${info.messageId}`);

    return info;
}

/**
 * @description Send SMS helper function
 * @param {String} receiver 
 * @param {String} data
 * @returns {Object}
 */
const sendSMS = (receiver, message) => {
    // Return if not in production
    if (process.env.NODE_ENV != "production") {
        console.log(process.env.NODE_ENV);
        return;
    }

    var params = {
        'originator': process.env.MESSAGE_BIRD_ORIGINATOR,
        'recipients': [
            receiver
        ],
        'body': message
    };

    messagebird.messages.create(
        params,
        function (error, response) {
            if (error) {
                console.log(`Error sending SMS: ${error}`)
                throw new Error(error);
            }

            console.log("SMS send successfully");
            return response;
        }
    );
}

/**
 * @description Get hashed password from plain text
 * @param {String} password 
 * @returns {String}
 */
const getHashedPassword = async (password) => {
    const hashedPassword = await argon2.hash(password);
    return hashedPassword;
}

/**
 * @param {String} password 
 * @param {String} hashedPassword 
 * @returns {Boolean}
 * @description Compare hashed and plain password & return if it is the same 
 */
const comparePassword = async (password, hashedPassword) => {
    const isPasswordSame = await argon2.verify(hashedPassword, password);
    return isPasswordSame;
}

/**
 * @description Remove an item from an array
 * @param {String} password 
 * @returns {String}
 */
const removeItemFromArray = (array, item) => {
    const index = array.indexOf(item);

    if (index > -1) {
        array.splice(index, 1);
    }

    return array;
}

/**
 * @description Conert a currency using Intl
 * @param {Number} amount 
 * @returns {String}
 */
const convertToCurrencyFormat = (amount) => {
    // const maximumFractionDigits = (amount.toString().split(".")[0] || "").length;
    amount = Math.ceil(amount);

    const currency = new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        // minimumFractionDigits: 0,
        // maximumFractionDigits
    }).format(amount);
    return currency;
}

/**
 * @description Calculate positive and negative percentage
 * @param {Object} badges 
 * @returns {Object}
 */
const calculatePositiveAndNegativePercent = (badges) => {
    // Get all perameters from badges
    const { total_reviews, total_good_reviews, total_bad_reviews } = badges;

    console.log(total_reviews, total_good_reviews, total_good_reviews)

    let percentages = new Object();

    // Calculate positive & negative percentages
    percentages.positive_percentage = total_reviews == 0 ? 0 : (total_good_reviews / total_reviews) * 100;
    percentages.negative_percentage = total_reviews == 0 ? 0 : (total_bad_reviews / total_reviews) * 100;

    return percentages;
}

/**
 * @description Check the difference between current time
 * & specified time
 * @param {Date} time 
 * @returns {Number}
 */
const differenceFromCurrentTime = (time, timeScale) => {
    const nowDate = dayjs(dayjs());
    const differenceInTimeScale = nowDate.diff(time, timeScale);
    return differenceInTimeScale;
}

/**
 * @description Get days ago from current date
 * @param {Date} dateTime
 * @returns {String}
 */
const daysAgo = (dateTime) => {
    const formattedDate = dayjs(dateTime).fromNow();
    return formattedDate;
}

/**
 * @description Generates a random 6 digit OTP
 * @returns {String}
 */
const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
}

/**
 * @description Generates a random 6 digit OTP
 * @returns {String}
 */
const generateRandomPassword = () => {
    const password = crypto.randomBytes(32).toString("hex");
    return password;
}

const signJwtToken = (data) => {
    return jwt.sign(
        // Encrypted value
        data,
        // Secret used to encrypt the token
        process.env.JWT_SECRET,
        // Expiry for the token
        {
            expiresIn: "5d"
        }
    );
}

export {
    sendMail,
    sendMailNodemailer,
    sendSMS,
    getHashedPassword,
    comparePassword,
    removeItemFromArray,
    convertToCurrencyFormat,
    calculatePositiveAndNegativePercent,
    differenceFromCurrentTime,
    daysAgo,
    generateOTP,
    generateRandomPassword,
    signJwtToken
}