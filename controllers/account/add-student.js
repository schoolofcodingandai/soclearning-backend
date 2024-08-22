// Express async handler
import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../constants/status.js';
import { validateAddStudent } from '../../validation/account/AddStudent.js';
import User from '../../models/user/User.js';
import { ROLES } from '../../constants/roles.js';
import { generateRandomPassword, getHashedPassword } from '../../helpers/helpers.js';

/**
 * @description Add student for teacher
 * @route POST /api/account/student
 * @access Private
 */
export default asyncHandler(async (req, res) => {

	// Validate request parameters
	const { error } = validateAddStudent(req.body);
	if (error) {
		res.status(HTTP_STATUS_CODES.BAD_REQUEST);
		throw new Error(error.details[0].message);
	}

	const { first_name, last_name, email, phone, current_class } = req.body;

	const foundStudent = await User.findOne({ email, role: ROLES.STUDENT });
	if (foundStudent) {
		res.status(HTTP_STATUS_CODES.BAD_REQUEST);
		throw new Error("Student already exists");
	}

	// Add a student
	const generatedPassword = generateRandomPassword();
	const hashedPassword = await getHashedPassword(generatedPassword);

	const student = new User({
		first_name,
		last_name,
		email,
		phone,
		current_class,
		role: ROLES.STUDENT,
		password: hashedPassword,
	});

	await student.save();

	return res.status(HTTP_STATUS_CODES.OK)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS,
			student
		});
});