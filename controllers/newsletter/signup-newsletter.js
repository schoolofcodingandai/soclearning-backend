import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../constants/status.js';
import { validateSignupNewsletter } from '../../validation/newsletter/SignupNewsletter.js';
import NewsletterSignup from '../../models/newsletter/NewsletterSignup.js';

/**
 * @description Sign up for newsletter 
 * @route POST /api/newsletter/signup
 * @access Public
 */
export default asyncHandler(async (req, res) => {
	// TODO: Cache this and timeout for performance
	
	const { error } = validateSignupNewsletter(req.body);
	if (error) {
		return res.status(HTTP_STATUS_CODES.BAD_REQUEST)
			.send({
				status: HTTP_STATUS_MESSAGES.ERROR,
				message: error.details[0].message
			});
	}

	const { email } = req.body;
	const foundNewsletterSignup = await NewsletterSignup.findOne({
		email,
	});

	if (!foundNewsletterSignup) {
		console.log('calling for the first time');
		const newsletterSignup = new NewsletterSignup({
			email
		});

		await newsletterSignup.save();
	}

	return res.status(HTTP_STATUS_CODES.OK)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS,
			message: 'Successfully signed up to our newsletter'
		});
});