// Express async handler
import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../../constants/status.js';
import Resource from '../../../models/resource/Resource.js';
import { validateUpdateResource } from '../../../validation/resource/UpdateResource.js';
import { imageBufferUpload, imageDelete } from '../../../helpers/aws-s3.js';
import { ASSET_TYPES } from '../../../helpers/uploader.js';
import mime from 'mime-types';

/**
 * @description Update resource for main website
 * @route POST /api/resource/admin/update
 * @access Private / Admin
 */
export default asyncHandler(async (req, res) => {

	try {
		const { error } = validateUpdateResource(req.body);
		if (error) {
			return res.status(HTTP_STATUS_CODES.BAD_REQUEST)
				.send({
					status: HTTP_STATUS_MESSAGES.ERROR,
					message: error.details[0].message
				});
		}

		const {
			resource_id
		} = req.body;

		const foundResource = await Resource.findOne({ _id: resource_id });
		if (!foundResource) {
			return res.status(HTTP_STATUS_CODES.NOT_FOUND)
				.send({
					status: HTTP_STATUS_MESSAGES.ERROR,
					message: 'Resource not found'
				});
		}

		const {
			thumbnail
		} = foundResource;

		let newThumbnail;
		if (req.file) {
			// Upload new image to S3
			console.log(req.file);
			const {
				mimetype,
				size,
				buffer,
				originalname,
			} = req.file;

			const uploadResponse = await imageBufferUpload(resource_id, buffer, mimetype, ASSET_TYPES.RESOURCE_IMAGE, originalname);

			// Delete old image from S3
			await imageDelete(thumbnail.key);

			// Save new image link to DB
			newThumbnail = {
				url: uploadResponse?.location,
				key: uploadResponse?.key,
				mimetype,
				size
			}
		}

		const updates = Object.keys(req.body);
		updates.forEach(update => update !== 'resource_id' && (foundResource[update] = req.body[update]));

		if (newThumbnail) {
			foundResource.thumbnail = newThumbnail;
		}

		await foundResource.save();

		return res.status(HTTP_STATUS_CODES.OK)
			.send({
				status: HTTP_STATUS_MESSAGES.SUCCESS,
				message: "Resource updated successfully"
			});
	} catch (error) {
		return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
			.send({
				status: HTTP_STATUS_MESSAGES.ERROR,
				message: error.message
			});
	}
});