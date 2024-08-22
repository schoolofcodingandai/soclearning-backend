// Mongoose
const mongoose = require("mongoose");

// Mongoose paginate v2
const mongoosePaginate = require("mongoose-paginate-v2");

/**
 * @description Defines a single notice
 */
const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: Object,
        required: true,
        default: {}
    },
    new_notice: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

noticeSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Notice", noticeSchema);