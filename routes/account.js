import { Router } from "express";
const router = Router();
import { addStudent, registerSchool, login } from "../controllers/account/index.js";
import { authByRole, verifyToken } from "../middleware/auth.js";
import { ROLES } from "../constants/roles.js";

// Common
router.post("/login", login);
router.post("/registerSchool", registerSchool);

// Teacher Admin
router.post("/student", verifyToken, authByRole([ROLES.TEACHER_ADMIN]), addStudent);

export default router;