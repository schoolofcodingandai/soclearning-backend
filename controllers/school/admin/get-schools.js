import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../../constants/status.js';
import School from '../../../models/school/School.js';

/**
 * @description Get all schools for admin
 * @route POST /api/school/admin
 * @access Private
 */
export default asyncHandler(async (req, res) => {

	// Get all schools
	const schools = await School.find({}).sort({ created_at: 1 });

	return res.status(HTTP_STATUS_CODES.OK)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS,
			schools
		});
});