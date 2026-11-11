const express = require('express');
const router = express.Router();
const {
  getCourses,
  getFeaturedCourses,
  getCategories,
  getCourseDetails,
  getCourseCurriculum,
} = require('../controllers/courseController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.get('/', getCourses);
router.get('/featured', getFeaturedCourses);
router.get('/categories', getCategories);
router.get('/:idOrSlug', optionalProtect, getCourseDetails);
router.get('/:id/learn', protect, getCourseCurriculum);

module.exports = router;
