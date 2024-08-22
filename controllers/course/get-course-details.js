// Express async handler
import asyncHandler from 'express-async-handler';
import Course from '../../models/course/Course.js';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../constants/status.js';
import { validateGetCourseDetails } from '../../validation/course/GetCourseDetails.js';

/**
 * @description Get course details for main website
 * @route GET /api/course/:id
 * @access Public
 */
export default asyncHandler(async (req, res) => {

	const { error } = validateGetCourseDetails(req.params);
	if (error) {
		return res.status(HTTP_STATUS_CODES.BAD_REQUEST)
			.send({
				status: HTTP_STATUS_MESSAGES.ERROR,
				message: error.details[0].message
			});
	}

	const foundCourse = await Course.findOne({ _id: req.params.id });

	if (!foundCourse) {
		return res.status(HTTP_STATUS_CODES.NOT_FOUND)
			.send({
				status: HTTP_STATUS_MESSAGES.ERROR,
				message: 'Course not found'
			});
	}

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
			course: foundCourse
		});
});