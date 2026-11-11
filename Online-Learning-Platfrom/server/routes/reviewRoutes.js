const express = require('express');
const router = express.Router();
const {
  getCourseReviews,
  createCourseReview,
  deleteCourseReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/course/:courseId', getCourseReviews);
router.post('/course/:courseId', protect, createCourseReview);
router.delete('/:id', protect, deleteCourseReview);

module.exports = router;
