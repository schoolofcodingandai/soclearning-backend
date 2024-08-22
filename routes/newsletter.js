import { Router } from "express";
import { getAllNewsletterSignups, signupForNewsletter } from "../controllers/newsletter/index.js";
import { authByRole, verifyToken } from "../middleware/auth.js";
import { ROLES } from "../constants/roles.js";
const router = Router();

router.post('/signup', signupForNewsletter);

// Admin
router.post('/admin', verifyToken, authByRole([ROLES.ADMIN]), getAllNewsletterSignups);

export default router;