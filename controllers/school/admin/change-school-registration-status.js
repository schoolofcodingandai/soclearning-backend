import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../../constants/status.js';
import RegisterSchool from '../../../models/register-school/RegisterSchool.js';
import { validateChangeSchoolRegistrationStatus } from '../../../validation/school/admin/ChangeSchoolRegistrationStatus.js';
import { HttpStatusCode } from 'axios';

/**
 * @description Change status for school registrations for admin
 * @route POST /api/school/admin/registrations/status
 * @access Private / Admin
 */
export default asyncHandler(async (req, res) => {

	const { error } = validateChangeSchoolRegistrationStatus(req.body);
	if (error) {
		return res.status(HttpStatusCode.BadRequest)
			.send({
				status: HTTP_STATUS_MESSAGES.ERROR,
				message: error.details[0].message
			});
	}

	const { id, status } = req.body;
	const schoolRequest = await RegisterSchool.findOne({ _id: id });
	if (!schoolRequest) {
		return res.status(HttpStatusCode.NotFound)
			.send({
				status: HTTP_STATUS_MESSAGES.ERROR,
				message: 'School Registration request was not found'
			});
	}

	schoolRequest.status = status;
	await schoolRequest.save();

	return res.status(HTTP_STATUS_CODES.OK)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS,
			schoolRequest
		});
});