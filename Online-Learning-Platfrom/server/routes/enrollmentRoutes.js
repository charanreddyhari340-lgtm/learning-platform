const express = require('express');
const router = express.Router();
const {
  enrollInCourse,
  getMyEnrollments,
  updateLessonProgress,
  submitQuiz,
  saveLessonNote,
  deleteLessonNote,
  getCertificate,
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');

// Public verification
router.get('/certificate/:certificateId', getCertificate);

// Protected student learning routes
router.use(protect);
router.post('/enroll/:courseId', enrollInCourse);
router.get('/my-learning', getMyEnrollments);
router.post('/:courseId/progress', updateLessonProgress);
router.post('/:courseId/quiz', submitQuiz);
router.post('/:courseId/notes', saveLessonNote);
router.delete('/:courseId/notes/:noteId', deleteLessonNote);

module.exports = router;
