import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_MESSAGES } from '../../../constants/status.js';
import { HttpStatusCode } from 'axios';
import NewsletterSignup from '../../../models/newsletter/NewsletterSignup.js';
import { validateGetAllNewsletterSignups } from '../../../validation/newsletter/admin/GetAllNewsletterSignups.js';

export default asyncHandler(async (req, res) => {

	const { error } = validateGetAllNewsletterSignups(req.body);
	if (error) {
		return res.status(HttpStatusCode.Ok)
			.send({
				status: HTTP_STATUS_MESSAGES.SUCCESS,
				message: error.details[0].message
			});
	}

	const { search } = req.body;

	let query = {};
	if (search) {
		query.email = { $regex: search, $options: 'i' }
	}

	const newsletterSignups = await NewsletterSignup.find(query).sort({ created_at: 1 });

	return res.status(HttpStatusCode.Ok)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS,
			newsletterSignups
		});
});