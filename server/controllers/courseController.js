const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { isTestCourseAccessEnabled } = require('../config/featureFlags');

// @desc    Get all published courses with query filtering, searching and sorting
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res, next) => {
  try {
    const {
      search,
      category,
      level,
      priceType,
      minRating,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isPublished: true };

    // Search by title, subtitle, or tags
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by difficulty level
    if (level && level !== 'All') {
      query.level = level;
    }

    // Filter by price type
    if (priceType === 'free') {
      query.price = 0;
    } else if (priceType === 'paid') {
      query.price = { $gt: 0 };
    }

    // Filter by minimum rating
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { studentsCount: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'price-low') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high') {
      sortOption = { price: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalCourses = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('instructor', 'name avatar headline bio')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Calculate total lessons and durations for summary display
    const formattedCourses = courses.map((course) => {
      let totalLessons = 0;
      let totalDurationMinutes = 0;

      if (course.modules) {
        course.modules.forEach((mod) => {
          if (mod.lessons) {
            totalLessons += mod.lessons.length;
            mod.lessons.forEach((l) => {
              totalDurationMinutes += Math.round((l.durationSeconds || 600) / 60);
            });
          }
        });
      }

      return {
        ...course,
        totalLessons,
        totalDurationMinutes,
      };
    });

    res.json({
      success: true,
      count: formattedCourses.length,
      total: totalCourses,
      totalPages: Math.ceil(totalCourses / limitNum),
      currentPage: pageNum,
      courses: formattedCourses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured & popular courses for landing page
// @route   GET /api/courses/featured
// @access  Public
const getFeaturedCourses = async (req, res, next) => {
  try {
    const featured = await Course.find({ isPublished: true, isFeatured: true })
      .populate('instructor', 'name avatar headline')
      .limit(6)
      .lean();

    const popular = await Course.find({ isPublished: true })
      .populate('instructor', 'name avatar headline')
      .sort({ studentsCount: -1, rating: -1 })
      .limit(8)
      .lean();

    res.json({
      success: true,
      featured,
      popular,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories stats
// @route   GET /api/courses/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = [
      { name: 'Web Development', icon: 'Code', color: '#6366f1' },
      { name: 'AI & Machine Learning', icon: 'Brain', color: '#a855f7' },
      { name: 'Data Science', icon: 'BarChart2', color: '#06b6d4' },
      { name: 'Cloud & DevOps', icon: 'Cloud', color: '#3b82f6' },
      { name: 'Cybersecurity', icon: 'ShieldCheck', color: '#ef4444' },
      { name: 'UI/UX Design', icon: 'Palette', color: '#ec4899' },
      { name: 'Mobile Development', icon: 'Smartphone', color: '#10b981' },
      { name: 'Software Engineering', icon: 'Layers', color: '#f59e0b' },
    ];

    const counts = await Course.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id] = c.count;
    });

    const result = categories.map((cat) => ({
      ...cat,
      courseCount: countMap[cat.name] || 0,
    }));

    res.json({
      success: true,
      categories: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course details by ID or slug
// @route   GET /api/courses/:idOrSlug
// @access  Public
const getCourseDetails = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let course;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(idOrSlug).populate(
        'instructor',
        'name avatar headline bio skills socialLinks'
      );
    } else {
      course = await Course.findOne({ slug: idOrSlug }).populate(
        'instructor',
        'name avatar headline bio skills socialLinks'
      );
    }

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let isEnrolled = false;
    let userProgress = 0;
    let enrollmentData = null;

    if (req.user) {
      const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: course._id,
      });

      if (enrollment) {
        isEnrolled = true;
        userProgress = enrollment.progress;
        enrollmentData = enrollment;
      }
    }

    // Calculate syllabus stats
    let totalLessons = 0;
    let totalDurationSeconds = 0;
    let totalQuizzes = 0;

    course.modules.forEach((mod) => {
      if (mod.lessons) {
        totalLessons += mod.lessons.length;
        mod.lessons.forEach((l) => {
          totalDurationSeconds += l.durationSeconds || 600;
          if (l.type === 'quiz' || (l.quiz && l.quiz.questions && l.quiz.questions.length > 0)) {
            totalQuizzes++;
          }
        });
      }
    });

    res.json({
      success: true,
      course,
      stats: {
        totalLessons,
        totalDurationSeconds,
        totalDurationMinutes: Math.round(totalDurationSeconds / 60),
        totalModules: course.modules.length,
        totalQuizzes,
      },
      userEnrollment: {
        isEnrolled,
        progress: userProgress,
        enrollmentId: enrollmentData ? enrollmentData._id : null,
      },
      testAccessEnabled: isTestCourseAccessEnabled(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get full learning curriculum for enrolled student
// @route   GET /api/courses/:id/learn
// @access  Private
const getCourseCurriculum = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    let course;

    if (courseId.match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(courseId).populate(
        'instructor',
        'name avatar headline'
      );
    } else {
      course = await Course.findOne({ slug: courseId }).populate(
        'instructor',
        'name avatar headline'
      );
    }

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course._id,
    });

    if (
      !enrollment &&
      req.user.role !== 'admin' &&
      String(course.instructor?._id) !== String(req.user._id) &&
      !isTestCourseAccessEnabled()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course. Please enroll to access the lessons.',
      });
    }

    res.json({
      success: true,
      course,
      enrollment: enrollment || {
        progress: 0,
        completedLessons: [],
        notes: [],
        quizScores: [],
        isCompleted: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getFeaturedCourses,
  getCategories,
  getCourseDetails,
  getCourseCurriculum,
};
