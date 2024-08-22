import { Router } from "express";
const router = Router();
import { addCourseCategory, addCourseForAdmin, getAllCategories, getCourseDetails, getCoursesForAdmin, getCoursesSiteall, getLessonUploadLinkForAdmin, updateCourseCategory } from "../controllers/course/index.js";
import { authByRole, verifyToken } from "../middleware/auth.js";
import { ROLES } from "../constants/roles.js";
import { ASSET_TYPES, IMAGE_FILES, MIME_TYPES, getPublicStorage, uploadImage, uploadSingleImage } from "../helpers/uploader.js";

// Course
router.post("/siteall", getCoursesSiteall);
router.get("/category", getAllCategories);

// Admin
router.get("/admin", verifyToken, authByRole([ROLES.ADMIN]), getCoursesForAdmin);
// router.put("/admin", verifyToken, authByRole([ROLES.ADMIN]), uploadImage(getPublicStorage(), [...Object.values(IMAGE_FILES)], MIME_TYPES.IMAGE).single('thumbnail'), addCourseForAdmin);
router.post("/admin", verifyToken, authByRole([ROLES.ADMIN]), uploadSingleImage([...Object.values(IMAGE_FILES)], MIME_TYPES.IMAGE, 1024 * 1024 * 1, ASSET_TYPES.COURSE_IMAGE).single('thumbnail'), addCourseForAdmin);

router.post("/admin/lesson/upload-link", verifyToken, authByRole([ROLES.ADMIN]), getLessonUploadLinkForAdmin);
router.post("/category/admin", verifyToken, authByRole([ROLES.ADMIN]), addCourseCategory);
router.post("/category/admin/update", verifyToken, authByRole([ROLES.ADMIN]), updateCourseCategory);

router.get("/:id", getCourseDetails);

export default router;