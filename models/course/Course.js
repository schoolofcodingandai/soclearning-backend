// Mongoose
import mongoose from "mongoose";

// Mongoose Paginate v2
import mongoosePaginate from "mongoose-paginate-v2";

/**
 * @description Defines the course schema
 */
const courseSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		min: 2,
		max: 255
	},
	description: {
		type: String,
		required: true,
		min: 2,
		max: 1024
	},
	thumbnail: {
		url: {
			type: String,
			required: true
		},
		key: {
			type: String,
			required: true
		},
		mimetype: {
			type: String,
			required: true
		},
		size: {
			type: Number,
			required: true
		}
	},
	category_id: {
		type: String,
		required: true
	},
	tags: [
		{
			type: String,
			required: true,
			min: 2,
			max: 255
		}
	],
	total_hours: {
		type: Number,
		required: true,
		default: 0
	},
	total_lessons: {
		type: Number,
		required: true,
		default: 0
	},
	total_assignments: {
		type: Number,
		required: true,
		default: 0
	},
}, {
	timestamps: {
		createdAt: "created_at",
		updatedAt: "updated_at"
	}
});

courseSchema.plugin(mongoosePaginate);
const Course = mongoose.model("Course", courseSchema);
export default Course;