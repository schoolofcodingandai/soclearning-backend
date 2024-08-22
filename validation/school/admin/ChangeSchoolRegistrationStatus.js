// Import Joi for validation
import Joi from "joi";
import joiObjectid from "joi-objectid";
import { SCHOOL_REGISTRATION_STATUS } from "../../../constants/status.js";
Joi.objectId = joiObjectid(Joi);

/**
 * 
 * @param {*} data 
 * @description Validation for changing status of school registration
 */
const validateChangeSchoolRegistrationStatus = (data) => {
    const schema = Joi.object({
        id: Joi.objectId().required(),
        status: Joi.string().valid(...Object.values(SCHOOL_REGISTRATION_STATUS)).required(),
    });

    return schema.validate(data);
}

export {
    validateChangeSchoolRegistrationStatus
}