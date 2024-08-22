// Express async handler
import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../constants/status.js';
import Category from '../../models/course/Category.js';

/**
 * @description Get course categories
 * @route GET /api/course/category
 * @access Public
 */
export default asyncHandler(async (req, res) => {

	const categories = await Category.find({}).sort({ created_at: -1 });

	return res.status(HTTP_STATUS_CODES.OK)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS,
			categories
		});
});