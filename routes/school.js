import { Router } from 'express';
import { authByRole, verifyToken } from '../middleware/auth.js';
import { ROLES } from '../constants/roles.js';
import { getSchoolDetails, getSchools, addSchool, getStats, getSchoolRegistrations, changeSchoolRegistrationStatus } from '../controllers/school/index.js';
const router = Router();

// Admin
router.post("/admin", verifyToken, authByRole([ROLES.ADMIN]), addSchool);
router.get("/admin", verifyToken, authByRole([ROLES.ADMIN]), getSchools);
router.get("/admin/stats", verifyToken, authByRole([ROLES.ADMIN]), getStats);
router.get("/admin/registrations", verifyToken, authByRole([ROLES.ADMIN]), getSchoolRegistrations);
router.post("/admin/registrations/status", verifyToken, authByRole([ROLES.ADMIN]), changeSchoolRegistrationStatus);
router.get("/admin/:id", verifyToken, authByRole([ROLES.ADMIN]), getSchoolDetails);

export default router;