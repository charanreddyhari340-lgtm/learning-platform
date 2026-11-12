const isTestCourseAccessEnabled = () =>
  process.env.ALLOW_TEST_COURSE_ACCESS === 'true';

const isSamplePaymentEnabled = () =>
  process.env.ALLOW_SAMPLE_PAYMENTS === 'true' || isTestCourseAccessEnabled();

module.exports = { isSamplePaymentEnabled, isTestCourseAccessEnabled };
