import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Star, Award } from 'lucide-react';
import { RatingStars } from './RatingStars';

export const CourseCard = ({ course }) => {
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Web Development':
        return 'badge-indigo';
      case 'AI & Machine Learning':
        return 'badge-amber';
      case 'Cloud & DevOps':
        return 'badge-cyan';
      case 'UI/UX Design':
        return 'badge-rose';
      case 'Cybersecurity':
        return 'badge-rose';
      default:
        return 'badge-emerald';
    }
  };

  return (
    <div className="course-card">
      <Link to={`/courses/${course.slug || course._id}`} style={{ textDecoration: 'none' }}>
        <div className="course-thumbnail-wrapper">
          <img
            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'}
            alt={course.title}
            className="course-thumbnail"
            loading="lazy"
          />
          <div className="course-category-tag">
            <span className={`badge ${getCategoryBadgeClass(course.category)}`}>
              {course.category}
            </span>
          </div>
          <div className="course-level-tag">
            {course.level}
          </div>
        </div>
      </Link>

      <div className="course-card-content">
        {/* Instructor */}
        <div className="course-instructor-row">
          <img
            src={
              course.instructor?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
            }
            alt={course.instructor?.name || 'UAV X'}
            className="instructor-avatar-xs"
          />
          <span className="instructor-name-xs">
            {course.instructor?.name || 'UAV X'}
          </span>
        </div>

        {/* Title */}
        <Link to={`/courses/${course.slug || course._id}`}>
          <h3 className="course-card-title">{course.title}</h3>
        </Link>

        {/* Subtitle */}
        <p className="course-card-subtitle">{course.subtitle}</p>

        {/* Rating & Stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.8rem',
            fontSize: '0.85rem',
          }}
        >
          <span style={{ fontWeight: '700', color: '#f59e0b' }}>
            {course.rating ? course.rating.toFixed(1) : '4.9'}
          </span>
          <RatingStars rating={course.rating || 4.9} size={14} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.775rem' }}>
            ({course.reviewsCount || 0})
          </span>
        </div>

        {/* Info Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.775rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.8rem',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={13} /> {course.totalLessons || (course.modules ? course.modules.reduce((a, m) => a + (m.lessons?.length || 0), 0) : 12)} lessons
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} /> {course.totalDurationMinutes || 120} min
          </span>
        </div>

        {/* Footer Meta: Price & CTA */}
        <div className="course-meta-row">
          <div className="course-price-wrap">
            {course.isFree || course.price === 0 ? (
              <span className="course-price-free">Free</span>
            ) : (
              <>
                <span className="course-price-current">₹{course.price.toLocaleString('en-IN')}</span>
                {course.originalPrice > course.price && (
                  <span className="course-price-original">₹{course.originalPrice.toLocaleString('en-IN')}</span>
                )}
              </>
            )}
          </div>

          <Link
            to={`/courses/${course.slug || course._id}`}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          >
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
};
