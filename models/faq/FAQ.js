// Mongoose
const mongoose = require("mongoose");

// Mongoose paginate v2
const mongoosePaginate = require("mongoose-paginate-v2");

/**
 * @description Defines a single FAQ
 */
const faqSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    is_link: {
        type: Boolean,
        default: false
    },
    link: {
        type: String
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

faqSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("FAQ", faqSchema);