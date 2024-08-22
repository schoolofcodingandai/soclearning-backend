// Mongoose
const mongoose = require("mongoose");

// Constants
const { ASSESSMENT_TYPE, GOOD_ASSESSMENT_OPTIONS, BAD_ASSESSMENT_OPTIONS } = require("../../constants/review");

// Mongoose paginate v2
const mongoosePaginate = require("mongoose-paginate-v2");

/**
 * @description Defines a single review
 */
const reviewSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Order"
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
    assessment_type: {
        type: Number,
        required: true,
        enum: Object.values(ASSESSMENT_TYPE)
    },
    comments: {
        type: String,
        required: true
    },
    review: [
        {
            type: Number,
            required: true,
            validate: {
                validator: function (value) {

                    if (this.assessment_type == ASSESSMENT_TYPE.GOOD && Object.values(GOOD_ASSESSMENT_OPTIONS).indexOf(value) === -1) {
                        return false;
                    }

                    if (this.assessment_type === ASSESSMENT_TYPE.BAD && Object.values(BAD_ASSESSMENT_OPTIONS).indexOf(value) === -1) {
                        return false;
                    }

                    return true;
                },
                message: props => `${props.value} is not a valid review for assessment_type`
            }
        }
    ],
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

reviewSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Review", reviewSchema);