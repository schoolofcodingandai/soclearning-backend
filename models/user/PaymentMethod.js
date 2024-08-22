// Mongoose
const mongoose = require("mongoose");

// Constants
const { PAYMENT_METHODS } = require("../../constants/payment-methods");

/**
 * @description Defines the user's payment method schema
 */
const paymentMethodSchema = new mongoose.Schema({
    payment_method: {
        required: true,
        type: String,
        enum: Object.values(PAYMENT_METHODS),
        default: PAYMENT_METHODS.BANK
    },
    bank_name: {
        type: String,
        min: 2,
        max: 1024,
        required: true
    },
    account_number: {
        type: String,
        min: 2,
        max: 255,
        required: true
    },
    account_holder_name: {
        type: String,
        required: true,
        min: 2,
        max: 255
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        min: 24
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);