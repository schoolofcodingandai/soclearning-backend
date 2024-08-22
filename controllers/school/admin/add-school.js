import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../../constants/status.js';
import { validateAddSchool } from '../../../validation/account/admin/AddSchool.js';
import School from '../../../models/school/School.js';
import User from '../../../models/user/User.js';
import { ROLES } from '../../../constants/roles.js';
import { generateRandomPassword, getHashedPassword, sendMailNodemailer } from '../../../helpers/helpers.js';

/**
 * @description Add school for admin
 * @route POST /api/account/admin/school
 * @access Private
 */
export default asyncHandler(async (req, res) => {

	// Validate request parameters
	const { error } = validateAddSchool(req.body);
	if (error) {
		res.status(HTTP_STATUS_CODES.BAD_REQUEST);
		throw new Error(error.details[0].message);
	}

	const { name, teacher_admin, email, phone } = req.body;
	const { first_name, last_name } = teacher_admin;

	// Check if school exists
	const school = await School.findOne({ email });
	if (school) {
		res.status(HTTP_STATUS_CODES.BAD_REQUEST);
		throw new Error("Teacher Admin already exists");
	}

	// Check if teacher admin exists
	const teacherAdmin = await User.findOne({ email: teacher_admin.email });
	if (teacherAdmin) {
		res.status(HTTP_STATUS_CODES.BAD_REQUEST);
		throw new Error("Teacher Admin already exists");
	}

	// Create teacher admin
	const generatedPassword = generateRandomPassword();
	const hashedPassword = await getHashedPassword(generatedPassword);
	const createdTeacherAdmin = await User.create({
		first_name,
		last_name,
		email: teacher_admin.email,
		role: ROLES.TEACHER_ADMIN,
		password: hashedPassword,
	});
	await createdTeacherAdmin.save();

	// Send email to teacher admin with password
	await sendMailNodemailer(teacher_admin.email, {
		email: teacher_admin.email,
		password: generatedPassword
	}, './templates/admin/teacher-admin-created.html', 'Welcome to SoC Learning | Teacher Admin Account Created');

	// Create school
	const createdSchool = await School.create({
		name,
		teacher_admin: createdTeacherAdmin._id,
		email,
		phone
	});
	await createdSchool.save();

	// Send email to teacher admin that school is created
	await sendMailNodemailer(teacher_admin.email, {
		school_name: name,
		teacher_admin_email: teacher_admin.email,
		school_email: email,
		school_phone: phone
	}, './templates/admin/school-created.html', 'Welcome to SoC Learning | School Created');

	return res.status(HTTP_STATUS_CODES.OK)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS
		});
});