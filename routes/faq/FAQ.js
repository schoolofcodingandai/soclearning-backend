const router = require("express").Router();

// Express Async Handler
const asyncHandler = require("express-async-handler");

// Constants
const { ROLES } = require("../../constants/roles");
const { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } = require("../../constants/status");

// Token verification middleware
const { authByRole, verifyToken } = require("../../middleware/auth");

// Models
const Notice = require("../../models/notice/Notice");

// Validation
const { addNoticeValidation, editNoticeValidation, deleteNoticeValidation } = require("../../validation/admin/Admin");
const { addFAQValidation, editFAQValidation, deleteFAQValidation } = require("../../validation/faq/FAQ");
const FAQ = require("../../models/faq/FAQ");

/**
 * @description Add a FAQ for admin
 * @route POST /api/faq
 * @access Private
 */
router.post("/", verifyToken, authByRole([ROLES.ADMIN]), asyncHandler(async (req, res) => {

    // Validate add FAQ method
    const { error } = addFAQValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get FAQ parameters from request body   
    let { title, content = "", is_link = false, link = "" } = req.body;

    // Create new FAQ
    const createdFAQ = await FAQ.create({
        title,
        content,
        is_link,
        link
    });

    return res.status(HTTP_STATUS_CODES.CREATED)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "faq created",
            id: createdFAQ._id,
            created_at: createdFAQ.created_at
        });
}));

/**
 * @description Edit a faq for admin
 * @route PUT /api/faq
 * @access Private
 */
router.put("/", verifyToken, authByRole([ROLES.ADMIN]), asyncHandler(async (req, res) => {

    // Validate edit FAQ method
    const { error } = editFAQValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get FAQ parameters from request body   
    let { faq_id, ...new_data } = req.body;

    // Check if FAQ exists
    const foundFAQ = await FAQ.findOne({ _id: faq_id });
    if (!foundFAQ) throw new Error("FAQ not found");

    // Find FAQ by id and update
    await FAQ.findByIdAndUpdate(
        faq_id,
        new_data,
        { new: true }
    );

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "FAQ edited"
        });
}));

/**
 * @description Get all FAQs with pagination
 * @route GET /api/faq/faqs/:page?
 * @access Public
 */
router.get("/faqs/:page?", asyncHandler(async (req, res) => {

    // Get page number from request parameters
    const { page = 1 } = req.params;

    // Get all notices
    FAQ.paginate(
        {},
        {
            page,
            limit: 10,
            sort: "-created_at"
        },
        function (error, result) {
            if (error) throw new Error(`error fetching FAQs: ${error}`);

            return res.status(HTTP_STATUS_CODES.OK)
                .send({
                    status: HTTP_STATUS_MESSAGES.SUCCESS,
                    result
                });
        }
    )

}));

/**
 * @description Delete a FAQ for admin
 * @route POST /api/faq/:faq_id
 * @access Private
 */
router.delete("/:faq_id", verifyToken, authByRole([ROLES.ADMIN]), asyncHandler(async (req, res) => {

    // Validate delete FAQ method
    const { error } = deleteFAQValidation(req.params);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get faq_id from request parameters
    const { faq_id } = req.params;

    // Delete FAQ
    await FAQ.findByIdAndDelete(
        faq_id
    );

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "FAQ deleted"
        });
}));

module.exports = router;