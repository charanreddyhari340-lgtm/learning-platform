const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const crypto = require('crypto');
const { isTestCourseAccessEnabled } = require('../config/featureFlags');

// @desc    Enroll student into a course
// @route   POST /api/enrollments/enroll/:courseId
// @access  Private
const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    let course;
    if (courseId.match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(courseId);
    } else {
      course = await Course.findOne({ slug: courseId });
    }

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course._id,
    });

    if (enrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course',
        enrollment,
      });
    }

    if (!course.isFree && Number(course.price) > 0 && !isTestCourseAccessEnabled()) {
      return res.status(402).json({
        success: false,
        message: 'Payment is required before enrolling in this course.',
      });
    }

    enrollment = await Enrollment.create({
      student: req.user._id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      course: course._id,
      progress: 0,
      completedLessons: [],
    });

    // Increment course student count
    await Course.findByIdAndUpdate(course._id, {
      $inc: { studentsCount: 1 },
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course!',
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enrolled courses for current student
// @route   GET /api/enrollments/my-learning
// @access  Private
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name avatar headline' },
      })
      .sort({ updatedAt: -1 });

    const formatted = enrollments.map((enr) => {
      let totalLessons = 0;
      if (enr.course && enr.course.modules) {
        enr.course.modules.forEach((m) => {
          if (m.lessons) totalLessons += m.lessons.length;
        });
      }

      return {
        _id: enr._id,
        course: enr.course,
        progress: enr.progress,
        completedLessonsCount: enr.completedLessons.length,
        totalLessons,
        isCompleted: enr.isCompleted,
        completedAt: enr.completedAt,
        certificateId: enr.certificateId,
        lastAccessedLesson: enr.lastAccessedLesson,
        enrolledAt: enr.enrolledAt,
        updatedAt: enr.updatedAt,
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      enrollments: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lesson progress (toggle complete) & update course %
// @route   POST /api/enrollments/:courseId/progress
// @access  Private
const updateLessonProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { lessonId, moduleId, isCompleted = true } = req.body;

    if (!lessonId) {
      return res.status(400).json({ success: false, message: 'lessonId is required' });
    }

    let course;
    if (courseId.match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(courseId);
    } else {
      course = await Course.findOne({ slug: courseId });
    }

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course._id,
    });

    if (!enrollment) {
      if (!isTestCourseAccessEnabled()) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course.',
        });
      }

      enrollment = await Enrollment.create({
        student: req.user._id,
        studentName: req.user.name,
        studentEmail: req.user.email,
        course: course._id,
      });
      await Course.findByIdAndUpdate(course._id, { $inc: { studentsCount: 1 } });
    }

    // Update last accessed
    if (lessonId) {
      enrollment.lastAccessedLesson = { moduleId: moduleId || '', lessonId };
    }

    // Calculate total lessons in course
    let allLessonIds = [];
    course.modules.forEach((mod) => {
      if (mod.lessons) {
        mod.lessons.forEach((l) => allLessonIds.push(String(l._id)));
      }
    });

    const totalLessons = allLessonIds.length || 1;
    const existingIndex = enrollment.completedLessons.findIndex(
      (cl) => String(cl.lessonId) === String(lessonId)
    );

    if (isCompleted && existingIndex === -1) {
      enrollment.completedLessons.push({
        lessonId: String(lessonId),
        completedAt: new Date(),
      });
    } else if (!isCompleted && existingIndex !== -1) {
      enrollment.completedLessons.splice(existingIndex, 1);
    }

    // Recalculate percentage
    const completedCount = enrollment.completedLessons.length;
    const newProgress = Math.min(100, Math.round((completedCount / totalLessons) * 100));
    enrollment.progress = newProgress;

    // Check if course completed
    if (newProgress >= 100 && !enrollment.isCompleted) {
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();
      if (!enrollment.certificateId) {
        enrollment.certificateId = 'CERT-' + crypto.randomBytes(6).toString('hex').toUpperCase();
      }
    }

    await enrollment.save();

    res.json({
      success: true,
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
      isCompleted: enrollment.isCompleted,
      certificateId: enrollment.certificateId,
      completedAt: enrollment.completedAt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Quiz answers for instant grading
// @route   POST /api/enrollments/:courseId/quiz
// @access  Private
const submitQuiz = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { lessonId, userAnswers } = req.body; // userAnswers: { questionIndex: selectedOptionIndex }

    let course;
    if (courseId.match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(courseId);
    } else {
      course = await Course.findOne({ slug: courseId });
    }

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course._id,
    });

    if (!enrollment && !isTestCourseAccessEnabled()) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course.',
      });
    }

    // Find the lesson with quiz
    let targetLesson = null;
    for (const mod of course.modules) {
      const found = mod.lessons.find((l) => String(l._id) === String(lessonId));
      if (found && found.quiz && found.quiz.questions && found.quiz.questions.length > 0) {
        targetLesson = found;
        break;
      }
    }

    if (!targetLesson) {
      return res.status(404).json({ success: false, message: 'Quiz not found for this lesson' });
    }

    if (!enrollment) {
      enrollment = await Enrollment.create({
        student: req.user._id,
        studentName: req.user.name,
        studentEmail: req.user.email,
        course: course._id,
      });
      await Course.findByIdAndUpdate(course._id, {
        $inc: { studentsCount: 1 },
      });
    }

    const quiz = targetLesson.quiz;
    const questions = quiz.questions;
    let correctCount = 0;

    const feedback = questions.map((q, idx) => {
      const studentAns = userAnswers[idx];
      const isCorrect = studentAns === q.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        questionIndex: idx,
        question: q.question,
        selectedAnswer: studentAns,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || '',
      };
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercentage >= (quiz.passingScore || 70);

    if (enrollment) {
      // Record quiz score
      const scoreObj = {
        lessonId: String(lessonId),
        lessonTitle: targetLesson.title,
        score: scorePercentage,
        totalQuestions: questions.length,
        passed,
        attemptedAt: new Date(),
      };

      const existingQuizIdx = enrollment.quizScores.findIndex(
        (qs) => String(qs.lessonId) === String(lessonId)
      );

      if (existingQuizIdx >= 0) {
        enrollment.quizScores[existingQuizIdx] = scoreObj;
      } else {
        enrollment.quizScores.push(scoreObj);
      }

      // If passed, mark lesson as completed
      if (passed) {
        const alreadyDone = enrollment.completedLessons.some(
          (cl) => String(cl.lessonId) === String(lessonId)
        );
        if (!alreadyDone) {
          enrollment.completedLessons.push({
            lessonId: String(lessonId),
            completedAt: new Date(),
          });

          // Recalculate overall progress
          let allLessonIds = [];
          course.modules.forEach((mod) => {
            if (mod.lessons) mod.lessons.forEach((l) => allLessonIds.push(String(l._id)));
          });
          enrollment.progress = Math.min(
            100,
            Math.round((enrollment.completedLessons.length / (allLessonIds.length || 1)) * 100)
          );

          if (enrollment.progress >= 100 && !enrollment.isCompleted) {
            enrollment.isCompleted = true;
            enrollment.completedAt = new Date();
            if (!enrollment.certificateId) {
              enrollment.certificateId = 'CERT-' + crypto.randomBytes(6).toString('hex').toUpperCase();
            }
          }
        }
      }

      await enrollment.save();
    }

    res.json({
      success: true,
      score: scorePercentage,
      correctCount,
      totalQuestions: questions.length,
      passingScore: quiz.passingScore || 70,
      passed,
      feedback,
      enrollmentProgress: enrollment ? enrollment.progress : null,
      certificateId: enrollment ? enrollment.certificateId : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save personal timestamped note
// @route   POST /api/enrollments/:courseId/notes
// @access  Private
const saveLessonNote = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { lessonId, lessonTitle, timestamp, text } = req.body;

    if (!text || !lessonId) {
      return res.status(400).json({ success: false, message: 'Note text and lessonId are required' });
    }

    let course;
    if (courseId.match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(courseId);
    } else {
      course = await Course.findOne({ slug: courseId });
    }

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course._id,
    });

    if (!enrollment) {
      if (!isTestCourseAccessEnabled()) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course.',
        });
      }

      enrollment = await Enrollment.create({
        student: req.user._id,
        studentName: req.user.name,
        studentEmail: req.user.email,
        course: course._id,
      });
      await Course.findByIdAndUpdate(course._id, {
        $inc: { studentsCount: 1 },
      });
    }

    enrollment.notes.unshift({
      lessonId,
      lessonTitle: lessonTitle || '',
      timestamp: Number(timestamp) || 0,
      text,
      createdAt: new Date(),
    });

    await enrollment.save();

    res.status(201).json({
      success: true,
      notes: enrollment.notes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete note
// @route   DELETE /api/enrollments/:courseId/notes/:noteId
// @access  Private
const deleteLessonNote = async (req, res, next) => {
  try {
    const { courseId, noteId } = req.params;

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    enrollment.notes = enrollment.notes.filter((n) => String(n._id) !== String(noteId));
    await enrollment.save();

    res.json({
      success: true,
      message: 'Note deleted',
      notes: enrollment.notes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get certificate data for verification or rendering
// @route   GET /api/enrollments/certificate/:certificateId
// @access  Public
const getCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    const enrollment = await Enrollment.findOne({ certificateId })
      .populate('student', 'name email avatar')
      .populate({
        path: 'course',
        select: 'title category level thumbnail',
        populate: { path: 'instructor', select: 'name headline' },
      });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid certificate ID',
      });
    }

    res.json({
      success: true,
      certificate: {
        certificateId: enrollment.certificateId,
        studentName: enrollment.student.name,
        studentAvatar: enrollment.student.avatar,
        courseTitle: enrollment.course.title,
        courseCategory: enrollment.course.category,
        courseLevel: enrollment.course.level,
        instructorName: enrollment.course.instructor?.name || 'UAV X',
        instructorTitle: enrollment.course.instructor ? enrollment.course.instructor.headline : 'Lead Instructor',
        issueDate: enrollment.completedAt || enrollment.updatedAt,
        isValid: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  updateLessonProgress,
  submitQuiz,
  saveLessonNote,
  deleteLessonNote,
  getCertificate,
};
