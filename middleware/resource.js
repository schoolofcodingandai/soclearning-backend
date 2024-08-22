import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from "../constants/status.js";
import { validateUpdateResource } from "../validation/resource/UpdateResource.js";

const validateUpdateResourceMiddleware = (req, res, next) => {
	console.log(req.body);
	

	next();
}

export {
	validateUpdateResourceMiddleware
}