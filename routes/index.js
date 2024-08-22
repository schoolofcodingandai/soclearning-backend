import { Router } from "express";
const router = Router();

import account from "./account.js";
import course from "./course.js";
import resource from "./resource.js";
import school from "./school.js";
import newsletter from "./newsletter.js";

router.use("/account", account);
router.use("/course", course);
router.use("/resource", resource);
router.use("/school", school);
router.use("/newsletter", newsletter);

export default router;