// Mongoose
const mongoose = require("mongoose");

// Constants
const { TRADE_COINS } = require("../../constants/trade");
const { TRANSACTION_TYPES } = require("../../constants/transaction");

// Mongoose paginate v2
const mongoosePaginate = require("mongoose-paginate-v2");

/**
 * @description Defines a single transaction
 */
const transactionSchema = new mongoose.Schema({
    transaction_type: {
        type: Number,
        required: true,
        emum: Object.values(TRANSACTION_TYPES)
    },
    trading_coin: {
        type: String,
        required: true,
        enum: Object.values(TRADE_COINS)
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    quantity: {
        type: Number,
        required: true
    },
    txn_id: {
        type: String
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

transactionSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Transaction", transactionSchema);