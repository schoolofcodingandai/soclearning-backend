// Express async handler
import asyncHandler from 'express-async-handler';
import Course from '../../../models/course/Course.js';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../../constants/status.js';
import { validateAddLesson } from '../../../validation/course/admin/AddLesson.js';

/**
 * @description Add a lesson for a course for admin
 * @route PUT /api/course/admin/lesson
 * @access Private/Admin
 */
export default asyncHandler(async (req, res) => {

	// Validation
	const { error } = validateAddLesson(req.body);
	if (error) {
		res.status(HTTP_STATUS_CODES.BAD_REQUEST);
		throw new Error(error.details[0].message);
	}

	// Validation for file upload - TODO - Convert to common validation function
	if (!req.file) {
		res.status(HTTP_STATUS_CODES.BAD_REQUEST);
		throw new Error("Video is required");
	}

	const { title, description, course_id } = req.body;

	// Check if course exists
	const course = await Course.findById(course_id);

	if (!course) {
		res.status(HTTP_STATUS_CODES.BAD_REQUEST);
		throw new Error("Course does not exist");
	}

	// Create a new course
	const { location, key } = req.file;
	console.log(req.file);
	console.log(location);

	await course.save();

	return res.status(HTTP_STATUS_CODES.OK)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS,
			course
		});
});