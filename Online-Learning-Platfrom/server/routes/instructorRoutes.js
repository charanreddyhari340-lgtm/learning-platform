const express = require('express');
const router = express.Router();
const {
  getInstructorStats,
  getInstructorCourses,
  getInstructorCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/instructorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('instructor', 'admin'));

router.get('/stats', getInstructorStats);
router.get('/courses', getInstructorCourses);
router.get('/courses/:id', getInstructorCourseById);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

module.exports = router;
