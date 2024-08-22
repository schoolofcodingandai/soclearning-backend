// Express async handler
import asyncHandler from 'express-async-handler';
import Course from '../../../models/course/Course.js';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../../constants/status.js';

/**
 * @description Get all courses for admin
 * @route GET /api/course/admin
 * @access Private/Admin
 */
export default asyncHandler(async (req, res) => {

	const { search } = req.query;

	let query = {};
	if (search) {
		query.title = { $regex: search, $options: 'i' };
	}

	// Get all courses
	const courses = await Course.find(query).sort({ created_at: -1 });

	return res.status(HTTP_STATUS_CODES.OK)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS,
			courses
		});
});