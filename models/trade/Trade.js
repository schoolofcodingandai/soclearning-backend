// Mongoose
const mongoose = require("mongoose");

// Constants
const { TRADE_TYPE, TRADE_COINS, TRADE_STATUS } = require("../../constants/trade");

// Mongoose paginate v2
const mongoosePaginate = require("mongoose-paginate-v2");

// Mongoose Aggregate Paginate v2
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

/**
 * @description Defines a single trade listing
 */
const tradeSchema = new mongoose.Schema({
    trade_type: {
        type: String,
        required: true,
        emum: Object.values(TRADE_TYPE)
    },
    trading_coin: {
        type: String,
        required: true,
        enum: Object.values(TRADE_COINS)
    },
    price: {
        type: Number,
        required: true
    },
    total_quantity: {
        type: Number,
        required: true
    },
    remaining_quantity: {
        type: Number,
        required: true
    },
    minimum_buy_amount: {
        type: Number,
        required: true
    },
    maximum_buy_amount: {
        type: Number,
        required: true
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    payment_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "PaymentMethod"
    },
    terms_agreed_time: {
        type: Date,
        required: true,
        default: Date.now()
    },
    buyers: [
        {
            buyer_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            buy_time: {
                type: Date
            },
            buy_quantity: {
                type: Number
            },
            buy_price_per_quantity: {
                type: Number
            },
            total_buy_price: {
                type: Number
            }
        }
    ],
    status: {
        type: Number,
        required: true,
        enum: Object.values(TRADE_STATUS),
        default: TRADE_STATUS.CREATED
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

tradeSchema.plugin(mongoosePaginate);
tradeSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model("Trade", tradeSchema);