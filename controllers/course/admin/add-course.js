// Express async handler
import asyncHandler from 'express-async-handler';
import Course from '../../../models/course/Course.js';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../../constants/status.js';
import { validateAddCourse } from '../../../validation/course/admin/AddCourse.js';
import { imageBufferUpload } from '../../../helpers/aws-s3.js';
import { Types } from 'mongoose';
import { ASSET_TYPES } from '../../../helpers/uploader.js';
import Category from '../../../models/course/Category.js';

/**
 * @description Add a course for admin
 * @route PUT /api/course/admin
 * @access Private/Admin
 */
export default asyncHandler(async (req, res) => {

	try {
		// Validation
		const { error } = validateAddCourse(req.body);
		if (error) {
			return res.status(HTTP_STATUS_CODES.BAD_REQUEST)
				.send({
					status: HTTP_STATUS_MESSAGES.ERROR,
					message: error.details[0].message
				});
		}

		if (!req.file) {
			return res.status(HTTP_STATUS_CODES.BAD_REQUEST)
				.send({
					status: HTTP_STATUS_MESSAGES.ERROR,
					message: 'Thumbnail is required'
				});
		}

		// Create a new course
		const { title, description, category_id } = req.body;
		const { mimetype, size, buffer, originalname } = req.file;
		const course_id = new Types.ObjectId().toString();
		console.log(course_id)

		// Check category
		const foundCategory = await Category.findOne({ _id: category_id });
		if (!foundCategory) {
			return res.status(HTTP_STATUS_CODES.NOT_FOUND)
				.send({
					status: HTTP_STATUS_MESSAGES.ERROR,
					message: 'Category not found'
				});
		}

		const uploadImageResponse = await imageBufferUpload(course_id, buffer, mimetype, ASSET_TYPES.COURSE_IMAGE, originalname);

		const thumbnail = {
			url: uploadImageResponse?.location,
			key: uploadImageResponse?.key,
			mimetype,
			size
		};

		const course = new Course({
			_id: course_id,
			title,
			description,
			thumbnail,
			category_id
		});

		await course.save();

		return res.status(HTTP_STATUS_CODES.OK)
			.send({
				status: HTTP_STATUS_MESSAGES.SUCCESS,
				course
			});
	} catch (error) {
		return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
			.send({
				status: HTTP_STATUS_MESSAGES.ERROR,
				message: error.message
			});
	}
});