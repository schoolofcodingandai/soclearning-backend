// Express async handler
import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../../constants/status.js';
import Resource from '../../../models/resource/Resource.js';
import { validateAddResource } from '../../../validation/resource/AddResource.js';

/**
 * @description Add resource for main website
 * @route POST /api/resource/admin/
 * @access Private / Admin
 */
export default asyncHandler(async (req, res) => {

	try {
		if (!req.file) {
			return res.status(HTTP_STATUS_CODES.BAD_REQUEST)
				.send({
					status: HTTP_STATUS_MESSAGES.ERROR,
					message: 'Thumbnail is required'
				});
		}

		const { error } = validateAddResource(req.body);
		if (error) {
			return res.status(HTTP_STATUS_CODES.BAD_REQUEST)
				.send({
					status: HTTP_STATUS_MESSAGES.ERROR,
					message: error.details[0].message
				});
		}

		const {
			title,
			subtitle,
			tags,
			content,
			type
		} = req.body;

		const {
			mimetype,
			size,
			metadata,
			key,
			location
		} = req.file;

		const resource = new Resource({
			_id: metadata.assetId,
			title,
			subtitle,
			tags,
			content,
			type,
			thumbnail: {
				url: location,
				key,
				mimetype,
				size
			}
		});

		await resource.save();

		return res.status(HTTP_STATUS_CODES.OK)
			.send({
				status: HTTP_STATUS_MESSAGES.SUCCESS,
				message: "Resource added successfully"
			});
	} catch (error) {
		return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
			.send({
				status: HTTP_STATUS_MESSAGES.ERROR,
				message: error.message
			});
	}
});