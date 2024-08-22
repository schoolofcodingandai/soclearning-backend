const router = require("express").Router();

// Express Async Handler
const asyncHandler = require("express-async-handler");

// Constants
const { ROLES } = require("../../constants/roles");
const { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } = require("../../constants/status");
const { SEARCH_INDEXES } = require("../../constants/search");

// Token verification middleware
const { authByRole, verifyToken } = require("../../middleware/auth");

// Models
const Notice = require("../../models/notice/Notice");

// Validation
const { addNoticeValidation, editNoticeValidation, deleteNoticeValidation } = require("../../validation/admin/Admin");

// Meilisearch
const { addDocumentToIndex, searchDocuments, deleteDocumentFromIndex, updateDocumentInIndex } = require("../../search");

/**
 * @description Add a notice for admin
 * @route POST /api/notice
 * @access Private
 */
router.post("/", verifyToken, authByRole([ROLES.ADMIN]), asyncHandler(async (req, res) => {

    // Validate add notice method
    const { error } = addNoticeValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get notice parameters from request body   
    let { title, content, new_notice = true } = req.body;

    // Create new notice
    const createdNotice = await Notice.create({
        title,
        content,
        new_notice
    });

    // Add document to index in MeiliSearch
    // addDocumentToIndex(SEARCH_INDEXES.NOTICES, createdNotice);

    return res.status(HTTP_STATUS_CODES.CREATED)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "notice added",
            id: createdNotice._id
        });
}));

/**
 * @description Edit a notice for admin
 * @route PUT /api/notice
 * @access Private
 */
router.put("/", verifyToken, authByRole([ROLES.ADMIN]), asyncHandler(async (req, res) => {

    // Validate edit notice method
    const { error } = editNoticeValidation(req.body);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get notice parameters from request body   
    let { notice_id, ...new_data } = req.body;

    // Check if notice exists
    const foundNotice = await Notice.findOne({ _id: notice_id });
    if (!foundNotice) throw new Error("notice not found");

    // Find notice by id and update
    const updatedNotice = await Notice.findByIdAndUpdate(
        notice_id,
        new_data,
        { new: true }
    );

    // Update search index
    // await updateDocumentInIndex(SEARCH_INDEXES.NOTICES, updatedNotice);

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "notice edited"
        });
}));

/**
 * @description Get all notices with pagination
 * @route GET /api/notice/notices/:page?
 * @access Public
 */
router.get("/notices/:page?", asyncHandler(async (req, res) => {

    // Get page number from request parameters
    const { page = 1 } = req.params;

    // Get all notices
    Notice.paginate(
        {},
        {
            page,
            limit: 10,
            sort: { new_notice: -1, created_at: -1 }
        },
        function (error, result) {
            if (error) throw new Error(`error fetching notices: ${error}`);

            return res.status(HTTP_STATUS_CODES.OK)
                .send({
                    status: HTTP_STATUS_MESSAGES.SUCCESS,
                    result
                });
        }
    )

}));

/**
 * @description Delete a notice for admin
 * @route POST /api/notice/:notice_id
 * @access Private
 */
router.delete("/:notice_id", verifyToken, authByRole([ROLES.ADMIN]), asyncHandler(async (req, res) => {

    // Validate delete notice method
    const { error } = deleteNoticeValidation(req.params);

    // Send a error message if user hasn't filled the required fields
    if (error) throw new Error(error.details[0].message);

    // Get notice_id from request parameters
    const { notice_id } = req.params;

    // Delete document from search index
    // await deleteDocumentFromIndex(SEARCH_INDEXES.NOTICES, notice_id);

    // Delete notice
    await Notice.findByIdAndDelete(
        notice_id
    );

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: "notice deleted"
        });
}));

/**
 * @description Search notice with pagination
 * @route GET /api/notice/search/:keyword/:page
 * @access Public
 */
router.get("/search/:keyword/:page?", asyncHandler(async (req, res) => {

    // Get keyword from request parameters
    const { keyword, page = 0 } = req.params;

    let parameters = {
        limit: 10,
        offset: parseInt(page),
        sort: ["created_at:desc"]
    }

    // Get all notices with the search keyword
    // let results = await searchDocuments(SEARCH_INDEXES.NOTICES, keyword, parameters);

    return res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            // results
        });

    // Notice.paginate(
    //     {
    //         $or: [
    //             {
    //                 "content": { $elemMatch: { $type: "string", $regex: keyword } }
    //             }
    //         ]
    //     },
    //     {
    //         page,
    //         limit: 10,
    //         sort: "-created_at"
    //     },
    //     function (error, result) {
    //         if (error) throw new Error(`error fetching notices: ${error}`);

    //         return res.status(HTTP_STATUS_CODES.OK)
    //             .send({
    //                 status: HTTP_STATUS_MESSAGES.SUCCESS,
    //                 result
    //             });
    //     }
    // )

}));

module.exports = router;