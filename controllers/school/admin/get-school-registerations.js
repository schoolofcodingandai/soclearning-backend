import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../../constants/status.js';
import RegisterSchool from '../../../models/register-school/RegisterSchool.js';

/**
 * @description Get school registrations for admin
 * @route GET /api/school/admin/registrations
 * @access Private / Admin
 */
export default asyncHandler(async (req, res) => {
	const schoolRequests = await RegisterSchool.find({}).sort({ created_at: -1 });

	return res.status(HTTP_STATUS_CODES.OK)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS,
			schoolRequests
		});
});