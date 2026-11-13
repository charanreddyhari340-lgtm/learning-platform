import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  Users,
  Star,
  Play,
  HelpCircle,
  FileText,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Paperclip,
  Download,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RatingStars } from '../components/RatingStars';
import { VideoPlayer } from '../components/VideoPlayer';
import { PayPalCheckout } from '../components/PayPalCheckout';

export const CourseDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [stats, setStats] = useState({});
  const [userEnrollment, setUserEnrollment] = useState({ isEnrolled: false });
  const [testAccessEnabled, setTestAccessEnabled] = useState(false);
  const [samplePaymentEnabled, setSamplePaymentEnabled] = useState(false);
  const [previewVideo, setPreviewVideo] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [reviews, setReviews] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Review Form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const previewRef = useRef(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const courseRes = await api.getCourseDetails(id);

        if (courseRes.success && courseRes.course) {
          setCourse(courseRes.course);
          setStats(courseRes.stats || {});
          setUserEnrollment(courseRes.userEnrollment || { isEnrolled: false });
          setTestAccessEnabled(courseRes.testAccessEnabled === true);
          setSamplePaymentEnabled(courseRes.samplePaymentEnabled === true);

          const firstFreeVideoPreview = (courseRes.course.modules || [])
            .flatMap((module) => module.lessons || [])
            .find((lesson) => lesson.type === 'video' && lesson.isFreePreview && lesson.videoUrl);
          setPreviewVideo(firstFreeVideoPreview?.videoUrl || courseRes.course.previewVideo || '');
          setPreviewTitle(firstFreeVideoPreview?.title || 'Introduction & Setup');

          // Expand first module by default
          if (courseRes.course?.modules?.length > 0) {
            setExpandedModules({ 0: true });
          }

          // Fetch reviews using course ID or slug
          try {
            const reviewsRes = await api.getCourseReviews(courseRes.course._id || id);
            if (reviewsRes.success) {
              setReviews(reviewsRes.reviews || []);
            }
          } catch (revErr) {
            console.warn('Reviews could not be loaded:', revErr);
          }
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id, isAuthenticated]);

  const toggleModule = (idx) => {
    setExpandedModules((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      addToast('Please login to enroll in this course', 'info');
      navigate('/login');
      return;
    }

    try {
      setIsEnrolling(true);
      const res = await api.enrollInCourse(course._id);
      if (res.success) {
        addToast('Successfully enrolled! Redirecting to classroom...', 'success');
        navigate(`/learn/${course._id}`);
      }
    } catch (err) {
      addToast(err.message || 'Enrollment failed', 'error');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleTestAccess = () => {
    if (!isAuthenticated) {
      addToast('Please login to access the test course', 'info');
      navigate('/login');
      return;
    }

    navigate(`/learn/${course._id}`);
  };

  const handlePreviewLesson = (lesson) => {
    setPreviewVideo(lesson.videoUrl);
    setPreviewTitle(lesson.title);
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handlePaymentSuccess = (res) => {
    addToast('Payment successful! Redirecting to classroom...', 'success');
    navigate(`/learn/${res.enrollment.course}`);
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please login to write a review', 'info');
      return;
    }

    if (!newComment.trim()) {
      addToast('Please write a feedback comment', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.addReview(course._id, {
        rating: newRating,
        comment: newComment.trim(),
      });

      if (res.success) {
        addToast('Review submitted! Thank you.', 'success');
        setNewComment('');
        // Refresh reviews
        const updated = await api.getCourseReviews(course._id);
        if (updated.success) setReviews(updated.reviews);
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const canAccessAllMaterials =
    course &&
    (userEnrollment.isEnrolled ||
      (isAuthenticated && testAccessEnabled) ||
      course.isFree ||
      Number(course.price) === 0);
  const allResources = course
    ? [
        ...(course.resources || []).map((resource) => ({
          ...resource,
          isFreePreview: false,
        })),
        ...(course.modules || []).flatMap((module) =>
          (module.lessons || []).flatMap((lesson) =>
            (lesson.resources || []).map((resource) => ({
              ...resource,
              isFreePreview: lesson.isFreePreview === true,
            })),
          ),
        ),
      ]
        .filter((resource) => resource?.url)
        .reduce((resources, resource) => {
          const existingResource = resources.find((item) => item.url === resource.url);
          if (existingResource) {
            existingResource.isFreePreview =
              existingResource.isFreePreview || resource.isFreePreview;
          } else {
            resources.push(resource);
          }
          return resources;
        }, [])
    : [];
  const visibleResources = allResources.filter(
    (resource) => canAccessAllMaterials || resource.isFreePreview,
  );
  const lockedResourceCount = allResources.length - visibleResources.length;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-secondary)' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-subtle)',
            borderTopColor: 'var(--brand-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem',
          }}
        />
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h2>Course not found</h2>
        <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* ================= HERO HEADER ================= */}
      <section
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-glass)',
          padding: '3.5rem 0',
        }}
      >
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem' }} className="course-hero-grid">
            <div>
              {/* Category & Level Badges */}
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span className="badge badge-indigo">{course.category}</span>
                <span className="badge badge-cyan">{course.level}</span>
                <span className="badge badge-emerald">Verified Curriculum</span>
              </div>

              <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', marginBottom: '1rem', lineHeight: '1.2' }}>
                {course.title}
              </h1>

              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {course.subtitle}
              </p>

              {/* Rating & Instructor Summary */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.2rem',
                  flexWrap: 'wrap',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: '700', color: '#f59e0b', fontSize: '1.1rem' }}>
                    {course.rating ? course.rating.toFixed(1) : '4.9'}
                  </span>
                  <RatingStars rating={course.rating || 4.9} size={16} />
                  <span style={{ color: 'var(--text-muted)' }}>({course.reviewsCount || 0} reviews)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                  <Users size={16} /> {course.studentsCount || 0} enrolled students
                </div>
              </div>

              {/* Instructor Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <img
                  src={
                    course.instructor?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                  }
                  alt={course.instructor?.name || 'UAV X'}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>Created by {course.instructor?.name || 'UAV X'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{course.instructor?.headline}</div>
                </div>
              </div>
            </div>

            {/* Video Preview Card */}
            <div ref={previewRef}>
              <div className="glass-panel" style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
                <VideoPlayer
                  key={previewVideo}
                  videoUrl={previewVideo}
                  title={previewTitle || course.title}
                />
                <div style={{ padding: '1.2rem', textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Previewing Lesson: <strong>{previewTitle || 'Introduction & Setup'}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT LAYOUT ================= */}
      <div className="container" style={{ marginTop: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem' }} className="course-body-grid">
          {/* Left Column: Syllabus, Outcomes, Reviews */}
          <div>
            {/* What You Will Learn */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1.2rem' }}>What You Will Master in This Course</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {(course.whatYouWillLearn || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                    <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span style={{ fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum / Syllabus Accordion */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.2rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.4rem' }}>Course Curriculum</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {stats.totalModules || course.modules?.length || 0} Modules • {stats.totalLessons || 0} Lessons • {stats.totalDurationMinutes || 0} min total length
                  </p>
                </div>
              </div>

              {/* Modules List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {(course.modules || []).map((mod, modIdx) => {
                  const isExpanded = !!expandedModules[modIdx];
                  const lessonCount = mod.lessons?.length || 0;

                  return (
                    <div
                      key={modIdx}
                      style={{
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-glass)',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Module Header Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleModule(modIdx)}
                        style={{
                          width: '100%',
                          padding: '1.1rem 1.4rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                            {mod.title}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
                          </span>
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>

                      {/* Expanded Lessons List */}
                      {isExpanded && (
                        <div style={{ padding: '0.5rem 0' }}>
                          {(mod.lessons || []).map((l, lIdx) => (
                            <div
                              key={lIdx}
                              style={{
                                padding: '0.75rem 1.4rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid var(--border-subtle)',
                                fontSize: '0.9rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {l.type === 'quiz' ? (
                                  <HelpCircle size={16} color="#a855f7" />
                                ) : l.type === 'reading' ? (
                                  <BookOpen size={16} color="#10b981" />
                                ) : (
                                  <Play size={16} color="#6366f1" />
                                )}
                                <span>{l.title}</span>
                                {l.isFreePreview && (
                                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                                    Free Preview
                                  </span>
                                )}
                                {l.resources && l.resources.length > 0 ? (
                                  <span className="badge badge-indigo" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                    <Paperclip size={10} /> {l.resources.length} {l.resources.length === 1 ? 'doc' : 'docs'}
                                  </span>
                                ) : (
                                  <span
                                    title="No downloadable materials have been added to this lesson."
                                    style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                                  >
                                    <Download size={10} /> No files
                                  </span>
                                )}
                              </div>

                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {l.duration || '10:00'}
                              </span>
                              {l.type === 'video' && l.isFreePreview && l.videoUrl && (
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handlePreviewLesson(l)}
                                  aria-label={`Watch free preview: ${l.title}`}
                                >
                                  <Play size={14} /> Watch preview
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {course && (
              <section className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1rem' }}>
                  <Download size={19} color="var(--brand-primary)" />
                  Lecture Resources & Downloadable Materials
                </h3>
                {visibleResources.length > 0 ? (
                  <div style={{ display: 'grid', gap: '0.6rem' }}>
                    {visibleResources.map((resource, index) => {
                      const isPdf = (resource.type || '').toLowerCase() === 'pdf' || /\.pdf$/i.test(resource.url || '');
                      const externalLink = /^https?:\/\//i.test(resource.url || '');

                      return (
                        <a
                          key={resource._id || `${resource.url}-${index}`}
                          href={resource.url}
                          download={isPdf ? undefined : (resource.filename || true)}
                          target={isPdf || externalLink ? '_blank' : undefined}
                          rel={isPdf || externalLink ? 'noopener noreferrer' : undefined}
                          aria-label={isPdf ? `Open ${resource.title || 'course resource'}` : `Download ${resource.title || 'course resource'}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            textDecoration: 'none',
                          }}
                        >
                        <span>{resource.title || 'Course resource'}</span>
                        <Download size={16} color="var(--brand-primary)" />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    {lockedResourceCount > 0
                      ? 'Sign in and enroll to download the course materials.'
                      : 'No downloadable materials have been added to this course yet.'}
                  </p>
                )}
                {visibleResources.length > 0 && lockedResourceCount > 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.75rem 0 0' }}>
                    Enroll to access the remaining course materials.
                  </p>
                )}
              </section>
            )}

            {/* Requirements & Target Audience */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Requirements & Prerequisites</h3>
              <ul style={{ paddingLeft: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
                {(course.requirements || ['No prior programming experience required.']).map((req, i) => (
                  <li key={i} style={{ marginBottom: '0.4rem' }}>{req}</li>
                ))}
              </ul>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Who Is This Course For?</h3>
              <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
                {(course.targetAudience || ['Anyone looking to build practical skills.']).map((aud, i) => (
                  <li key={i} style={{ marginBottom: '0.4rem' }}>{aud}</li>
                ))}
              </ul>
            </div>

            {/* Student Reviews Section */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <MessageSquare size={22} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.4rem' }}>Student Feedback & Reviews ({reviews.length})</h3>
              </div>

              {/* Add Review Box */}
              {userEnrollment.isEnrolled ? (
                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.8rem' }}>Leave Your Course Review</h4>
                  <form onSubmit={handleAddReview}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                      <span style={{ fontSize: '0.85rem' }}>Rating:</span>
                      <RatingStars
                        rating={newRating}
                        interactive={true}
                        onRatingChange={(r) => setNewRating(r)}
                        size={20}
                      />
                    </div>
                    <textarea
                      placeholder="Share your honest learning experience, what you built, and what you enjoyed..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="form-textarea"
                      style={{ minHeight: '80px', marginBottom: '0.8rem' }}
                    />
                    <button type="submit" disabled={submittingReview} className="btn btn-primary btn-sm">
                      {submittingReview ? 'Posting...' : 'Submit Feedback'}
                    </button>
                  </form>
                </div>
              ) : (
                <div
                  style={{
                    padding: '1rem 1.4rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Enroll in this course to leave a review and share your learning feedback with the community.
                </div>
              )}

              {/* Reviews List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No reviews yet. Be the first to share your thoughts after enrolling!
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev._id}
                      style={{
                        padding: '1.2rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-glass)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <img
                            src={rev.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                            alt={rev.user?.name}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{rev.user?.name}</div>
                            <RatingStars rating={rev.rating} size={12} />
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Enrollment Card */}
          <div>
            <div
              className="glass-panel"
              style={{
                padding: '2rem',
                position: 'sticky',
                top: '90px',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                {course.isFree || course.price === 0 ? (
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#38bdf8' }}>Free</div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--brand-emerald)' }}>
                      ₹{course.price ? course.price.toLocaleString('en-IN') : '0'}
                    </span>
                    {course.originalPrice > course.price && (
                      <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        ₹{course.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              {userEnrollment.isEnrolled ? (
                <Link
                  to={`/learn/${course._id}`}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginBottom: '1.2rem' }}
                >
                  Continue Learning <ArrowRight size={18} />
                </Link>
              ) : course.isFree || course.price === 0 ? (
                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginBottom: '1.2rem' }}
                  >
                    {isEnrolling ? 'Enrolling...' : 'Enroll for Free'}
                  </button>
                ) : showPayment ? (
                  <div style={{ marginBottom: '1.2rem' }}>
                    <PayPalCheckout
                      courseId={course._id}
                      samplePaymentEnabled={samplePaymentEnabled}
                      onSuccess={handlePaymentSuccess}
                      onError={(error) => addToast(error.message || 'Payment failed', 'error')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPayment(false)}
                      style={{ width: '100%', color: 'var(--text-secondary)', marginTop: '0.6rem', fontSize: '0.85rem' }}
                    >
                      Cancel payment
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        addToast('Please login to purchase this course', 'info');
                        navigate('/login');
                        return;
                      }
                      setShowPayment(true);
                    }}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginBottom: '1.2rem' }}
                  >
                    Pay with PayPal
                  </button>
                )}

              {testAccessEnabled &&
                !userEnrollment.isEnrolled &&
                !course.isFree &&
                course.price > 0 && (
                  <button
                    type="button"
                    onClick={handleTestAccess}
                    className="btn btn-secondary btn-lg"
                    style={{ width: '100%', marginBottom: '1.2rem' }}
                  >
                    Open course (test access)
                  </button>
                )}

              {/* Course Includes List */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.2rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.8rem', fontWeight: '600' }}>
                  This Course Includes:
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Play size={14} color="#6366f1" /> {stats.totalDurationMinutes || 120} min on-demand video
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={14} color="#a855f7" /> Interactive graded quizzes
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={14} color="#10b981" /> Verifiable Certificate of Completion
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={14} color="#06b6d4" /> Downloadable study guides & documents
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={14} color="#06b6d4" /> Full lifetime access on web & mobile
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .course-hero-grid, .course-body-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
