// Express async handler
import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../../constants/status.js';
import { validateAddCourseCategory } from '../../../validation/course/admin/AddCourseCategory.js';
import Category from '../../../models/course/Category.js';

/**
 * @description Add a course category for admin
 * @route POST /api/course/category/admin
 * @access Private / Admin
 */
export default asyncHandler(async (req, res) => {

	// Validation
	const { error } = validateAddCourseCategory(req.body);
	if (error) {
		return res.status(HTTP_STATUS_CODES.BAD_REQUEST)
			.send({
				status: HTTP_STATUS_MESSAGES.ERROR,
				message: error.details[0].message
			});
	}

	// Create a new category
	const { title } = req.body;

	const category = new Category({
		title
	});

	await category.save();

	return res.status(HTTP_STATUS_CODES.OK)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS,
			category
		});
});