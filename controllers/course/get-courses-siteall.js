// Express async handler
import asyncHandler from 'express-async-handler';
import Course from '../../models/course/Course.js';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../constants/status.js';
import { validateGetCourses } from '../../validation/course/GetCourses.js';
import Category from '../../models/course/Category.js';

/**
 * @description Get all courses for main website
 * @route GET /api/course/siteall
 * @access Public
 */
export default asyncHandler(async (req, res) => {

	const { error } = validateGetCourses(req.body);
	if (error) {
		return res.status(HTTP_STATUS_CODES.BAD_REQUEST)
			.send({
				status: HTTP_STATUS_MESSAGES.ERROR,
				message: error.details[0].message
			});
	}

	// Get all courses
	const { category_id, search } = req.body;
	let query = {};

	if (search) {
		query.title = { $regex: search, $options: 'i' };
	}

	if (category_id) {
		const foundCategory = await Category.findOne({ _id: category_id });
		if (foundCategory) {
			query.category_id = category_id;
		}
	}

	const courses = await Course.find(query).sort({ created_at: -1 });

	// Send only essential information
	// const account = {
	// 	first_name,
	// 	last_name,
	// 	client_id,
	// 	id,
	// 	email,
	// 	phone,
	// 	created_at,
	// 	updated_at,
	// 	positive_percentage: percentages.positive_percentage,
	// 	negative_percentage: percentages.negative_percentage,
	// 	payment_methods: foundUser.payment_methods,
	// 	wallets
	// };

	return res.status(HTTP_STATUS_CODES.OK)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS,
			courses
		});
});