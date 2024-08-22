// Mongoose
const mongoose = require("mongoose");

/**
 * @description Defines the user's badges and review average
 */
const badgeSchema = new mongoose.Schema({
    total_reviews: {
        type: Number,
        required: true,
        default: 0
    },
    total_good_reviews: {
        type: Number,
        required: true,
        default: 0
    },
    total_bad_reviews: {
        type: Number,
        required: true,
        default: 0
    },
    badges: []
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

module.exports = badgeSchema;