import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../constants/status.js';
import User from '../../models/user/User.js';
import { comparePassword, signJwtToken } from '../../helpers/helpers.js';
import { validateLogin } from '../../validation/account/Login.js';

/**
 * @description Login user
 * @route POST /api/account/login
 * @access Public
 */
export default asyncHandler(async (req, res) => {

	// Validate request parameters
	const { error } = validateLogin(req.body);
	if (error) {
		res.status(HTTP_STATUS_CODES.BAD_REQUEST);
		throw new Error(error.details[0].message);
	}

	const { email, password } = req.body;

	const user = await User.findOne({ email });
	if (!user) {
		res.status(HTTP_STATUS_CODES.BAD_REQUEST);
		throw new Error("User not found");
	}

	const isPasswordValid = await comparePassword(password, user.password);
	if (!isPasswordValid) {
		res.status(HTTP_STATUS_CODES.BAD_REQUEST);
		throw new Error("Password is not valid");
	}

	// Generate JWT token
	const token = signJwtToken({
		id: user._id,
		email: user.email,
		role: user.role
	});

	user.token = token;
	await user.save();

	return res.status(HTTP_STATUS_CODES.OK)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS,
			token,
			name: user.first_name,
			email: user.email,
			role: user.role
		});
});