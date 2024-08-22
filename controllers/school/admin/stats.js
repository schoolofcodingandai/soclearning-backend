import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../../constants/status.js';
import School from '../../../models/school/School.js';
import User from '../../../models/user/User.js';
import { ROLES } from '../../../constants/roles.js';

/**
 * @description Get total schools, schools added this month, total trainers, total trainer admins, total learners and learners added this month
 * @route GET /api/school/admin/stats
 * @access Private / Admin
 */
export default asyncHandler(async (req, res) => {
	try {
		const currentDate = new Date();
		const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
		const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

		const totalSchools = await School.countDocuments({});
		const schoolsAddedThisMonth = await School.countDocuments({
			createdAt: {
				$gte: firstDayOfMonth,
				$lte: lastDayOfMonth
			}
		});

		const totalTrainers = await User.countDocuments({
			role: ROLES.TEACHER
		});
		const totalTrainerAdmins = await User.countDocuments({
			role: ROLES.TEACHER_ADMIN
		});

		const totalLearners = await User.countDocuments({
			role: ROLES.STUDENT
		});
		const learnersAddedThisMonth = await User.countDocuments({
			role: ROLES.STUDENT,
			createdAt: {
				$gte: firstDayOfMonth,
				$lte: lastDayOfMonth,
			}
		});

		return res.status(HTTP_STATUS_CODES.OK)
			.send({
				status: HTTP_STATUS_MESSAGES.SUCCESS,
				stats: {
					total_schools: totalSchools,
					schools_added_this_month: schoolsAddedThisMonth,
					total_trainers: totalTrainers,
					total_trainer_admins: totalTrainerAdmins,
					total_learners: totalLearners,
					learners_added_this_month: learnersAddedThisMonth
				}
			});
	} catch (err) {
		console.log(err);
		return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
			.send({
				status: HTTP_STATUS_MESSAGES.ERROR,
				error: err
			});
	};
});