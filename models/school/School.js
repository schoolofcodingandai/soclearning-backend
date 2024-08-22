// Mongoose
import mongoose from "mongoose";

// Mongoose Paginate v2
import mongoosePaginate from "mongoose-paginate-v2";

/**
 * @description Defines the school schema
 */
const schoolSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		min: 2,
		max: 255
	},
	teacher_admin: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	email: {
		type: String,
		required: true,
		min: 2,
		max: 255
	},
	phone: {
		type: String,
		required: true,
		min: 9,
		max: 14
	},
	logo: {
		type: Object,
		default: {},
		url: {
			type: String
		},
		key: {
			type: String
		},
		type: {
			type: String
		},
		size: {
			type: Number
		}
	}
}, {
	timestamps: {
		createdAt: "created_at",
		updatedAt: "updated_at"
	}
});

schoolSchema.plugin(mongoosePaginate);
const School = mongoose.model("School", schoolSchema);
export default School