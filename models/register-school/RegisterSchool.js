// Mongoose
import mongoose from "mongoose";

// Mongoose Paginate v2
import mongoosePaginate from "mongoose-paginate-v2";

/**
 * @description Defines the school registration schema
 */
const registerSchoolSchema = new mongoose.Schema({
	commissioner_name: {
		type: String,
		required: true,
		min: 2,
		max: 255
	},
	school_name: {
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
	email: {
		type: String,
		required: true,
		min: 2,
		max: 255
	},
	message: {
		type: String,
		required: true,
		min: 2,
		max: 1024
	},
	status: {
		type: String,
		required: true,
		default: 'C',
	}
}, {
	timestamps: {
		createdAt: "created_at",
		updatedAt: "updated_at"
	}
});

registerSchoolSchema.plugin(mongoosePaginate);
const RegisterSchool = mongoose.model("RegisterSchool", registerSchoolSchema);
export default RegisterSchool;