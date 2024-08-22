// Express async handler
import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../constants/status.js';
import { validateRegisterSchool } from '../../validation/account/RegisterSchool.js';
import RegisterSchool from '../../models/register-school/RegisterSchool.js';

/**
 * @description Register school for main website
 * @route POST /api/account/registerSchool
 * @access Public
 */
export default asyncHandler(async (req, res) => {

	// Validate request parameters
	const { error } = validateRegisterSchool(req.body);
	if (error) {
		res.status(HTTP_STATUS_CODES.BAD_REQUEST);
		throw new Error(error.details[0].message);
	}

	const { commissioner_name, school_name, phone, email, message } = req.body;

	// Get all courses
	const registerSchool = new RegisterSchool({
		commissioner_name,
		school_name,
		phone,
		email,
		message
	});

	await registerSchool.save();

	return res.status(HTTP_STATUS_CODES.OK)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS
		});
});