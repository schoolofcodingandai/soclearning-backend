// Express async handler
import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../constants/status.js';
import Resource from '../../models/resource/Resource.js';

/**
 * @description Get resource detail for main website
 * @route GET /api/resource/{resourceId}
 * @access Public
 */
export default asyncHandler(async (req, res) => {

	const { resourceId } = req.params;

	// Get all resources
	const resource = await Resource.findOne({ _id: resourceId });

	return res.status(HTTP_STATUS_CODES.OK)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS,
			resource
		});
});