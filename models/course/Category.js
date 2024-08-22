// Mongoose
import mongoose from "mongoose";

// Mongoose Paginate v2
import mongoosePaginate from "mongoose-paginate-v2";

/**
 * @description Defines the category schema
 */
const categorySchema = new mongoose.Schema({
	title: {
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

categorySchema.plugin(mongoosePaginate);
const Category = mongoose.model("Category", categorySchema);
export default Category;