// Express async handler
import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../../constants/status.js';
import Category from '../../../models/course/Category.js';
import { validateUpdateCourseCategory } from '../../../validation/course/admin/UpdateCourseCategory.js';

/**
 * @description Update course category for admin
 * @route POST /api/course/category/admin/update
 * @access Private / Admin
 */
export default asyncHandler(async (req, res) => {

	// Validation
	const { error } = validateUpdateCourseCategory(req.body);
	if (error) {
		return res.status(HTTP_STATUS_CODES.BAD_REQUEST)
			.send({
				status: HTTP_STATUS_MESSAGES.ERROR,
				message: error.details[0].message
			});
	}

	const { category_id, title } = req.body;

	const foundCategory = await Category.findOne({ _id: category_id });
	if (!foundCategory) {
		return res.status(HTTP_STATUS_CODES.NOT_FOUND)
			.send({
				status: HTTP_STATUS_MESSAGES.ERROR,
				message: 'Category not found'
			});
	}

	foundCategory.title = title;
	await foundCategory.save();

	return res.status(HTTP_STATUS_CODES.OK)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS,
			category: foundCategory
		});
});