import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../../constants/status.js';
import School from '../../../models/school/School.js';

/**
 * @description Get school details for admin
 * @route GET /api/school/admin/:id
 * @access Private
 */
export default asyncHandler(async (req, res) => {
	const { id } = req.params;
	if (!id) {
		return res.status(HTTP_STATUS_CODES.BAD_REQUEST)
			.send({
				status: HTTP_STATUS_MESSAGES.ERROR,
				message: "School id is required"
			});
	}

	// Get school details
	const school = await School.findOne({ _id: id });

	if (!school) {
		return res.status(HTTP_STATUS_CODES.NOT_FOUND)
			.send({
				status: HTTP_STATUS_MESSAGES.ERROR,
				message: "School not found"
			});
	}

	return res.status(HTTP_STATUS_CODES.OK)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS,
			school
		});
});