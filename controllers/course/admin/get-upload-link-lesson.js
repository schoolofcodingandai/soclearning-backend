// Express async handler
import asyncHandler from 'express-async-handler';
import Course from '../../../models/course/Course.js';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../../constants/status.js';
import { validateAddLesson } from '../../../validation/course/admin/AddLesson.js';
import axios from 'axios';

/**
 * @description Get an upload link for TUS Resumable uploads
 * @route GET /api/course/admin/lesson/upload-link
 * @access Private/Admin
 */
export default asyncHandler(async (req, res) => {

	// Validation
	// const { error } = validateAddLesson(req.body);
	// if (error) {
	// 	res.status(HTTP_STATUS_CODES.BAD_REQUEST);
	// 	throw new Error(error.details[0].message);
	// }

	// Validation for file upload - TODO - Convert to common validation function
	// if (!req.file) {
	// 	res.status(HTTP_STATUS_CODES.BAD_REQUEST);
	// 	throw new Error("Video is required");
	// }

	// const { title, description, course_id } = req.body;

	// Generate link from cloudflare
	console.log(process.env.CF_STREAM_API_KEY);
	axios.post(
		`https://api.cloudflare.com/client/v4/accounts/${process.env.CF_STREAM_ACCOUNT_ID}/stream?direct_upload=true`,
		{},
		{
			headers: {
				'Authorization': `Bearer ${process.env.CF_STREAM_API_KEY}`,
				'Tus-Resumable': '1.0.0',
				'Upload-Length': '1',
				'Upload-Metadata': 'maxdurationseconds NjAw',
			}
		}
	).then((cf_response) => {
		console.log(cf_response.headers.location);
		return res.status(HTTP_STATUS_CODES.OK)
			.send({
				status: HTTP_STATUS_MESSAGES.SUCCESS,
				location: cf_response?.headers?.location,
			});
	}).catch((cf_error) => {
		console.log(cf_error?.response?.data?.errors || cf_error);
		return res.status(HTTP_STATUS_CODES.BAD_REQUEST)
			.send({
				status: HTTP_STATUS_MESSAGES.ERROR,
				error: cf_error,
			});
	});

});