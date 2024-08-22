// Mongoose
import mongoose from "mongoose";

// Mongoose Paginate v2
import mongoosePaginate from "mongoose-paginate-v2";

/**
 * @description Defines the newsletter signup schema
 */
const newsletterSignupSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		min: 2,
		max: 255
	},
}, {
	timestamps: {
		createdAt: "created_at",
		updatedAt: "updated_at"
	}
});

newsletterSignupSchema.plugin(mongoosePaginate);
const NewsletterSignup = mongoose.model("NewsletterSignup", newsletterSignupSchema);
export default NewsletterSignup;