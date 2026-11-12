const isTestCourseAccessEnabled = () =>
  process.env.ALLOW_TEST_COURSE_ACCESS === 'true';

module.exports = { isTestCourseAccessEnabled };
