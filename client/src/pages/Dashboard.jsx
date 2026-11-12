import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  Play,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CertificateModal } from '../components/CertificateModal';

export const Dashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [certModalOpen, setCertModalOpen] = useState(false);

  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        const res = await api.getMyEnrollments();
        if (res.success) {
          setEnrollments(res.enrollments || []);
        }
      } catch (err) {
        console.error('Error fetching learning dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningData();
  }, []);

  const completedCourses = enrollments.filter((e) => e.progress === 100 || e.isCompleted);
  const activeCourses = enrollments.filter((e) => e.progress < 100);

  const handleOpenCertificate = (enr) => {
    setSelectedCert({
      certificateId: enr.certificateId || 'CERT-SKILLFORGE-2026',
      studentName: user?.name || 'Alex Morgan',
      courseTitle: enr.course?.title,
      courseCategory: enr.course?.category,
      instructorName: enr.course?.instructor?.name || 'UAV X',
      issueDate: enr.completedAt || enr.updatedAt,
    });
    setCertModalOpen(true);
  };

  return (
    <div style={{ padding: '3rem 0 6rem' }}>
      <div className="container">
        {/* Welcome Header */}
        <div
          className="glass-panel-heavy"
          style={{
            padding: '2.5rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=140&q=80'}
              alt={user?.name}
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--border-glass)',
              }}
            />
            <div>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>
                Welcome back, {user?.name}! 👋
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {user?.headline || 'Continue your journey towards tech skill mastery.'}
              </p>
            </div>
          </div>

          <Link to="/courses" className="btn btn-primary">
            Explore More Courses <ArrowRight size={16} />
          </Link>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
              <BookOpen size={20} color="#6366f1" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enrolled Courses</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{enrollments.length}</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
              <TrendingUp size={20} color="#38bdf8" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Courses</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{activeCourses.length}</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
              <Award size={20} color="#fbbf24" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Certificates Earned</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{completedCourses.length}</div>
          </div>
        </div>

        {/* Active In-Progress Courses */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>In Progress ({activeCourses.length})</h2>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
              Loading learning courses...
            </div>
          ) : activeCourses.length === 0 ? (
            <div
              className="glass-panel"
              style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <BookOpen size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.8rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>No courses in progress</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
                Browse our catalog and enroll in a course to start learning.
              </p>
              <Link to="/courses" className="btn btn-primary btn-sm">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.8rem' }}>
              {activeCourses.map((enr) => (
                <div
                  key={enr._id}
                  className="glass-panel"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <img
                    src={enr.course?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'}
                    alt={enr.course?.title}
                    style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                  />

                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span className="badge badge-indigo" style={{ alignSelf: 'flex-start', marginBottom: '0.6rem' }}>
                      {enr.course?.category || 'Web Development'}
                    </span>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.8rem', lineHeight: '1.35' }}>
                      {enr.course?.title}
                    </h3>

                    {/* Progress */}
                    <div style={{ marginTop: 'auto', marginBottom: '1.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {enr.completedLessonsCount} / {enr.totalLessons} lessons
                        </span>
                        <span style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>
                          {enr.progress}%
                        </span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${enr.progress}%` }} />
                      </div>
                    </div>

                    <Link
                      to={`/learn/${enr.course?._id}`}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.65rem' }}
                    >
                      Resume Learning <Play size={15} fill="#fff" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Completed Courses & Certificates */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <Award size={22} color="#fbbf24" />
            <h2 style={{ fontSize: '1.5rem' }}>Completed Courses & Certificates ({completedCourses.length})</h2>
          </div>

          {completedCourses.length === 0 ? (
            <div
              className="glass-panel"
              style={{
                padding: '2.5rem 2rem',
                textAlign: 'center',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Award size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.8rem', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Complete all lessons and quizzes in a course to unlock your verifiable certificate!
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.8rem' }}>
              {completedCourses.map((enr) => (
                <div
                  key={enr._id}
                  className="glass-panel"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.05) 0%, rgba(17, 24, 39, 0.8) 100%)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                    <CheckCircle2 size={20} color="#10b981" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#34d399' }}>
                      100% Completed
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.6rem' }}>
                    {enr.course?.title}
                  </h3>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Credential ID: {enr.certificateId || 'CERT-EDUPULSE-2026'}
                  </p>

                  <div style={{ display: 'flex', gap: '0.8rem', marginTop: 'auto' }}>
                    <button
                      onClick={() => handleOpenCertificate(enr)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      <Award size={15} /> View Certificate
                    </button>
                    <Link to={`/learn/${enr.course?._id}`} className="btn btn-secondary btn-sm">
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certificate={selectedCert}
      />
    </div>
  );
};
