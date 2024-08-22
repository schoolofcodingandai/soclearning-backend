// Mongoose
const mongoose = require("mongoose");

// Constants
const { ORDER_STATUS } = require("../../constants/status");

// Mongoose paginate v2
const mongoosePaginate = require("mongoose-paginate-v2");

/**
 * @description Defines a single order
 */
const orderSchema = new mongoose.Schema({
    trade_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Trade"
    },
    quantity: {
        type: Number,
        required: true
    },
    buyer_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    price: {
        type: Number,
        required: true
    },
    total_amount: {
        type: Number,
        required: true
    },
    depositor_name: {
        type: String,
        required: true
    },
    deposited_amount: {
        type: Number,
        required: true
    },
    review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    },
    status: {
        type: Number,
        required: true,
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.CREATED
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

orderSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Order", orderSchema);