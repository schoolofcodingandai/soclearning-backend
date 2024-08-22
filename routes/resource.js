import { Router } from "express";
const router = Router();
import { addResource, getResourceDetail, getResources, updateResource } from "../controllers/resource/index.js";
import { authByRole, verifyToken } from "../middleware/auth.js";
import { ROLES } from "../constants/roles.js";
import { ASSET_TYPES, IMAGE_FILES, MIME_TYPES, getPublicStorage, uploadImage, uploadSingleImage } from "../helpers/uploader.js";
import { validateUpdateResourceMiddleware } from "../middleware/resource.js";

// Resource
router.post("/", getResources);
router.get("/:resourceId", getResourceDetail);

// Admin
router.post("/admin", verifyToken, authByRole([ROLES.ADMIN]), uploadImage(null, [...Object.values(IMAGE_FILES)], MIME_TYPES.IMAGE, 1024 * 1024 * 1, ASSET_TYPES.RESOURCE_IMAGE).single('thumbnail'), addResource);
router.post("/admin/update", verifyToken, authByRole([ROLES.ADMIN]), uploadSingleImage([...Object.values(IMAGE_FILES)], MIME_TYPES.IMAGE, 1024 * 1024 * 1, ASSET_TYPES.RESOURCE_IMAGE).single('thumbnail'), updateResource);

export default router;