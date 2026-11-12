const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { isSamplePaymentEnabled } = require('../config/featureFlags');

const getPayPalBaseUrl = () =>
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

const getPayPalAccessToken = async () => {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    const error = new Error('PayPal is not configured on the server');
    error.statusCode = 503;
    throw error;
  }

  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString('base64');
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error_description || 'Unable to authenticate with PayPal');
    error.statusCode = 502;
    throw error;
  }

  return data.access_token;
};

const getCourse = async (courseId) => {
  if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
    return Course.findOne({ slug: courseId });
  }
  return Course.findById(courseId);
};

const createPayPalOrder = async (req, res, next) => {
  try {
    const course = await getCourse(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.isFree || !course.price || course.price <= 0) {
      return res.status(400).json({ success: false, message: 'This course does not require payment' });
    }

    const token = await getPayPalAccessToken();
    const currency = process.env.PAYPAL_CURRENCY || 'INR';
    const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: course._id.toString(),
          custom_id: req.user._id.toString(),
          description: course.title.slice(0, 127),
          amount: { currency_code: currency, value: Number(course.price).toFixed(2) },
        }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || 'Unable to create PayPal order');
      error.statusCode = 502;
      throw error;
    }

    res.status(201).json({ success: true, orderId: data.id });
  } catch (error) {
    next(error);
  }
};

const capturePayPalOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: 'PayPal order ID is required' });

    const token = await getPayPalAccessToken();
    const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: '{}',
    });
    const data = await response.json();
    if (!response.ok || data.status !== 'COMPLETED') {
      const error = new Error(data.message || 'PayPal payment was not completed');
      error.statusCode = 400;
      throw error;
    }

    const unit = data.purchase_units?.[0];
    if (unit?.custom_id !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'This PayPal order does not belong to the current user' });
    }
    const course = await getCourse(unit?.reference_id || '');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found for this payment' });

    const capturedAmount = unit.payments?.captures?.[0]?.amount;
    const expectedCurrency = process.env.PAYPAL_CURRENCY || 'INR';
    if (
      !capturedAmount ||
      capturedAmount.currency_code !== expectedCurrency ||
      Number(capturedAmount.value) !== Number(course.price).toFixed(2) * 1
    ) {
      return res.status(400).json({ success: false, message: 'Payment amount verification failed' });
    }

    let enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id });
    if (!enrollment) {
      enrollment = await Enrollment.create({
        student: req.user._id,
        studentName: req.user.name,
        studentEmail: req.user.email,
        course: course._id,
        progress: 0,
        completedLessons: [],
        paymentProvider: 'paypal',
        paymentId: orderId,
        paymentStatus: 'completed',
      });
      await Course.findByIdAndUpdate(course._id, { $inc: { studentsCount: 1 } });
    }

    res.json({ success: true, message: 'Payment completed and enrollment created', enrollment });
  } catch (error) {
    next(error);
  }
};

const createSamplePayment = async (req, res, next) => {
  try {
    if (!isSamplePaymentEnabled()) {
      return res.status(404).json({ success: false, message: 'Sample payments are disabled' });
    }

    const course = await getCourse(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.isFree || !course.price || course.price <= 0) {
      return res.status(400).json({ success: false, message: 'This course does not require payment' });
    }

    let enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id });
    if (!enrollment) {
      enrollment = await Enrollment.create({
        student: req.user._id,
        studentName: req.user.name,
        studentEmail: req.user.email,
        course: course._id,
        progress: 0,
        completedLessons: [],
        paymentProvider: 'sample',
        paymentId: `SAMPLE-${Date.now()}`,
        paymentStatus: 'completed',
      });
      await Course.findByIdAndUpdate(course._id, { $inc: { studentsCount: 1 } });
    }

    res.status(201).json({
      success: true,
      message: 'Sample payment completed and enrollment created',
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPayPalOrder, capturePayPalOrder, createSamplePayment };
