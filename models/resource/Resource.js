// Mongoose
import mongoose from "mongoose";

// Mongoose Paginate v2
import mongoosePaginate from "mongoose-paginate-v2";
import { RESOURCE_TYPES } from "../../constants/resource.js";

/**
 * @description Defines the resource schema
 */
const resourceSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		min: 2,
		max: 255
	},
	subtitle: {
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
	tags: [
		{
			type: String,
			required: true,
			min: 2,
			max: 255
		}
	],
	content: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
		enum: RESOURCE_TYPES
	}
}, {
	timestamps: {
		createdAt: "created_at",
		updatedAt: "updated_at"
	}
});

resourceSchema.plugin(mongoosePaginate);
const Resource = mongoose.model("Resource", resourceSchema);
export default Resource;