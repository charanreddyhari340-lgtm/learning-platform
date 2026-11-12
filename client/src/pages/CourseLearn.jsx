import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Play,
  HelpCircle,
  Award,
  StickyNote,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  FileText,
  Sparkles,
  Download,
  ExternalLink,
  BookOpen,
  FolderDown,
  File,
  Paperclip,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { VideoPlayer } from '../components/VideoPlayer';
import { QuizModal } from '../components/QuizModal';
import { CertificateModal } from '../components/CertificateModal';
import { NotesDrawer } from '../components/NotesDrawer';

export const CourseLearn = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurriculum = async () => {
      setIsLoading(true);
      try {
        const res = await api.getCourseCurriculum(id);
        if (res.success) {
          setCourse(res.course);
          setEnrollment(res.enrollment);

          // If last accessed lesson exists, find its index
          if (res.enrollment?.lastAccessedLesson?.lessonId && res.course?.modules) {
            const targetId = res.enrollment.lastAccessedLesson.lessonId;
            res.course.modules.forEach((mod, mIdx) => {
              const lIdx = mod.lessons.findIndex((l) => String(l._id) === String(targetId));
              if (lIdx !== -1) {
                setCurrentModuleIndex(mIdx);
                setCurrentLessonIndex(lIdx);
              }
            });
          }
        }
      } catch (err) {
        addToast(err.message || 'Failed to load classroom', 'error');
        navigate(`/courses/${id}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurriculum();
  }, [id, navigate, addToast]);

  const currentModule = course?.modules?.[currentModuleIndex];
  const currentLesson = currentModule?.lessons?.[currentLessonIndex];

  // Helper to check if a lesson is completed
  const isLessonCompleted = (lessonId) => {
    return !!enrollment?.completedLessons?.some((cl) => String(cl.lessonId) === String(lessonId));
  };

  const handleToggleLessonComplete = async (lessonId) => {
    const currentlyDone = isLessonCompleted(lessonId);
    try {
      const res = await api.updateProgress(id, {
        lessonId,
        moduleId: currentModule?._id,
        isCompleted: !currentlyDone,
      });

      if (res.success) {
        setEnrollment((prev) => ({
          ...prev,
          progress: res.progress,
          completedLessons: res.completedLessons,
          isCompleted: res.isCompleted,
          certificateId: res.certificateId,
        }));

        if (!currentlyDone) {
          addToast('Lesson marked as completed!', 'success');
        }

        // Trigger celebratory confetti if newly reached 100%
        if (res.progress === 100 && !currentlyDone) {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
          });
          addToast('Course 100% Completed! Certificate unlocked.', 'success');
        }
      }
    } catch (err) {
      addToast(err.message || 'Failed to update progress', 'error');
    }
  };

  // Next and Previous Lesson navigation
  const handleSelectLesson = (mIdx, lIdx) => {
    setCurrentModuleIndex(mIdx);
    setCurrentLessonIndex(lIdx);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Sync last accessed
    const target = course?.modules?.[mIdx]?.lessons?.[lIdx];
    if (target) {
      api.updateProgress(id, {
        lessonId: target._id,
        moduleId: course?.modules?.[mIdx]?._id,
        isCompleted: isLessonCompleted(target._id),
      }).catch(console.error);
    }
  };

  const handleNextLesson = () => {
    if (!course?.modules) return;
    const currentModLessons = currentModule?.lessons || [];

    if (currentLessonIndex < currentModLessons.length - 1) {
      handleSelectLesson(currentModuleIndex, currentLessonIndex + 1);
    } else if (currentModuleIndex < course.modules.length - 1) {
      handleSelectLesson(currentModuleIndex + 1, 0);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      handleSelectLesson(currentModuleIndex, currentLessonIndex - 1);
    } else if (currentModuleIndex > 0) {
      const prevMod = course.modules[currentModuleIndex - 1];
      handleSelectLesson(currentModuleIndex - 1, (prevMod.lessons?.length || 1) - 1);
    }
  };

  // Open Certificate Modal
  const handleOpenCertificate = async () => {
    if (enrollment?.certificateId) {
      try {
        const res = await api.getCertificate(enrollment.certificateId);
        if (res.success) {
          setCertificateData(res.certificate);
          setCertificateModalOpen(true);
        }
      } catch (err) {
        // Fallback certificate data
        setCertificateData({
          certificateId: enrollment.certificateId,
          studentName: user?.name || 'Alex Morgan',
          courseTitle: course?.title,
          courseCategory: course?.category,
          instructorName: course?.instructor?.name || 'UAV X',
          issueDate: enrollment.completedAt || new Date(),
        });
        setCertificateModalOpen(true);
      }
    } else {
      addToast('Complete 100% of course lessons to unlock your certificate!', 'info');
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
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
          <p style={{ color: 'var(--text-secondary)' }}>Loading your classroom...</p>
        </div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h2>Unable to load lesson</h2>
        <Link to={`/courses/${id}`} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Course Overview
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 74px)', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* ================= TOP CLASSROOM NAV ================= */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-glass)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to={`/courses/${course.slug || course._id}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={16} /> Course Overview
          </Link>
          <span style={{ color: 'var(--border-glass)' }}>|</span>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '380px' }}>
            {course.title}
          </h2>
        </div>

        {/* Progress & Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: '150px' }}>
            <div className="progress-track" style={{ width: '100px' }}>
              <div className="progress-fill" style={{ width: `${enrollment?.progress || 0}%` }} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--brand-emerald)' }}>
              {enrollment?.progress || 0}%
            </span>
          </div>

          {/* Notes Drawer Button */}
          <button
            onClick={() => setNotesOpen(true)}
            className="btn btn-secondary btn-sm"
            title="Open Lecture Notes"
          >
            <StickyNote size={15} /> Notes
          </button>

          {/* Certificate Button */}
          <button
            onClick={handleOpenCertificate}
            className={`btn btn-sm ${enrollment?.progress === 100 ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              borderColor: enrollment?.progress === 100 ? 'transparent' : 'rgba(212, 175, 55, 0.4)',
              color: enrollment?.progress === 100 ? '#fff' : '#facc15',
            }}
          >
            <Award size={15} /> Certificate
          </button>

          {/* Sidebar Toggle for smaller screens */}
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="btn-icon"
            title="Toggle Curriculum Sidebar"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* ================= MAIN CLASSROOM VIEWPORT ================= */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Lesson Center Content */}
        <div style={{ flex: 1, padding: '2rem', maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
          {/* Main Media Player / Quiz Screen */}
          <div style={{ marginBottom: '1.8rem' }}>
            {currentLesson.type === 'quiz' ? (
              /* Quiz Card Screen */
              <div
                className="glass-panel"
                style={{
                  padding: '3.5rem 2rem',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%), var(--bg-secondary)',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(168, 85, 247, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.2rem',
                  }}
                >
                  <HelpCircle size={32} color="#a855f7" />
                </div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.6rem' }}>
                  {currentLesson.quiz?.title || currentLesson.title}
                </h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 2rem', fontSize: '0.95rem' }}>
                  Test your mastery of the concepts covered in this module with interactive multiple-choice questions.
                </p>
                <button
                  onClick={() => setQuizModalOpen(true)}
                  className="btn btn-primary btn-lg"
                >
                  <Sparkles size={18} /> Launch Assessment Quiz
                </button>
              </div>
            ) : currentLesson.type === 'reading' ? (
              /* Reading / Document Lesson Article */
              <div
                className="glass-panel"
                style={{
                  padding: '2.5rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: '#10b981' }}>
                  <BookOpen size={22} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Reading Lecture • {currentLesson.duration || '08:00'} min read
                  </span>
                </div>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>{currentLesson.title}</h1>
                <div
                  style={{
                    fontSize: '1rem',
                    lineHeight: '1.8',
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                    background: 'var(--bg-tertiary)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {currentLesson.content || 'Please refer to the lecture summary and attached documents below to complete this reading lesson.'}
                </div>
              </div>
            ) : (
              /* Custom Video Player (Supports YouTube, Vimeo, Uploaded MP4) */
              <div>
                <VideoPlayer
                  videoUrl={currentLesson.videoUrl || course.previewVideo}
                  title={currentLesson.title}
                  onTimeUpdate={(t) => setCurrentTimestamp(t)}
                  onEnded={() => {
                    if (!isLessonCompleted(currentLesson._id)) {
                      handleToggleLessonComplete(currentLesson._id);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Lesson Info Header & Completion Toggle */}
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: '600', textTransform: 'uppercase' }}>
                Module {currentModuleIndex + 1} • Lesson {currentLessonIndex + 1}
              </span>
              <h2 style={{ fontSize: '1.4rem', marginTop: '2px' }}>{currentLesson.title}</h2>
            </div>

            <button
              onClick={() => handleToggleLessonComplete(currentLesson._id)}
              className={`btn ${isLessonCompleted(currentLesson._id) ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.6rem 1.2rem' }}
            >
              <CheckCircle2 size={18} />
              {isLessonCompleted(currentLesson._id) ? 'Completed' : 'Mark as Complete'}
            </button>
          </div>

          {/* Lesson Content & Resources */}
          {currentLesson.content && (
            <div className="glass-panel" style={{ padding: '1.8rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>Lecture Summary & Notes</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.925rem' }}>
                {currentLesson.content}
              </p>
            </div>
          )}

          {/* Lesson Downloadable Resources */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--brand-primary)" /> Lecture Resources & Downloadable Materials
            </h3>
            {currentLesson.resources && currentLesson.resources.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {currentLesson.resources.map((res, rIdx) => (
                  <a
                    key={rIdx}
                    href={res.url}
                    download={res.filename || true}
                    aria-label={`Download ${res.title || 'lecture resource'}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Download size={16} color="var(--brand-primary)" />
                      <span style={{ fontWeight: '600' }}>{res.title || 'Lecture Resource File'}</span>
                      <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>
                        {(res.type || 'file').toUpperCase()}
                      </span>
                      {res.size && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({res.size})</span>
                      )}
                    </div>
                    <ExternalLink size={14} color="var(--text-muted)" />
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                No downloadable materials have been added to this lecture yet.
              </p>
            )}
          </div>

          {/* Bottom Next / Prev Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem' }}>
            <button
              onClick={handlePrevLesson}
              disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
              className="btn btn-secondary"
            >
              <ChevronLeft size={18} /> Previous Lesson
            </button>

            <button onClick={handleNextLesson} className="btn btn-primary">
              Next Lesson <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* ================= RIGHT CURRICULUM SIDEBAR ================= */}
        {sidebarOpen && (
          <aside
            style={{
              width: '360px',
              background: 'var(--bg-secondary)',
              borderLeft: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                padding: '1.2rem',
                borderBottom: '1px solid var(--border-subtle)',
                position: 'sticky',
                top: 0,
                background: 'var(--bg-secondary)',
                zIndex: 10,
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Course Syllabus</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {enrollment?.completedLessons?.length || 0} of {course.modules.reduce((a, m) => a + (m.lessons?.length || 0), 0)} completed
              </p>
            </div>

            {/* Course-Wide Materials / Documents */}
            <div
              style={{
                margin: '0.8rem 0.8rem 0',
                padding: '0.8rem',
                background: 'rgba(168, 85, 247, 0.08)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FolderDown size={15} color="#a855f7" />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Course Documents & Resources ({course.resources?.length || 0})
                </span>
              </div>
              {course.resources?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {course.resources.map((res, rIdx) => (
                    <a
                      key={rIdx}
                      href={res.url}
                      download={res.filename || true}
                      aria-label={`Download ${res.title || 'course resource'}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.4rem 0.6rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                        {res.title}
                      </span>
                      <Download size={13} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
                    </a>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>
                  No course-wide files have been uploaded.
                </p>
              )}
            </div>

            {/* Modules Accordion */}
            <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {course.modules.map((mod, mIdx) => (
                <div
                  key={mIdx}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-tertiary)',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Module {mIdx + 1}: {mod.title}
                  </div>

                  <div>
                    {mod.lessons.map((lesson, lIdx) => {
                      const isActive = mIdx === currentModuleIndex && lIdx === currentLessonIndex;
                      const isDone = isLessonCompleted(lesson._id);

                      return (
                        <button
                          key={lIdx}
                          onClick={() => handleSelectLesson(mIdx, lIdx)}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            textAlign: 'left',
                            background: isActive ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                            borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
                            borderBottom: '1px solid var(--border-subtle)',
                            color: isActive ? 'var(--brand-primary)' : 'var(--text-primary)',
                            fontSize: '0.85rem',
                            transition: 'all 0.15s',
                          }}
                        >
                          {/* Checkbox toggle */}
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleLessonComplete(lesson._id);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {isDone ? (
                              <CheckCircle2 size={18} color="#10b981" />
                            ) : (
                              <Circle size={18} color="var(--text-muted)" />
                            )}
                          </span>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontWeight: isActive ? '600' : '400',
                              }}
                            >
                              {lesson.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              <span>{lesson.type === 'quiz' ? 'Quiz Assessment' : lesson.type === 'reading' ? 'Reading' : 'Video'} • {lesson.duration || '10:00'}</span>
                              {lesson.resources && lesson.resources.length > 0 ? (
                                <span title={`${lesson.resources.length} document attachment(s)`} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--brand-primary)' }}>
                                  <Paperclip size={12} /> {lesson.resources.length}
                                </span>
                              ) : (
                                <span title="No downloadable materials have been added to this lesson." style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--text-muted)' }}>
                                  <Download size={12} /> 0
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      {/* ================= MODALS & DRAWERS ================= */}
      <QuizModal
        courseId={id}
        lesson={currentLesson}
        isOpen={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        onQuizCompleted={(res) => {
          if (res.passed) {
            setEnrollment((prev) => ({
              ...prev,
              progress: res.enrollmentProgress ?? prev.progress,
              certificateId: res.certificateId ?? prev.certificateId,
            }));
          }
        }}
      />

      <CertificateModal
        isOpen={certificateModalOpen}
        onClose={() => setCertificateModalOpen(false)}
        certificate={certificateData}
      />

      <NotesDrawer
        courseId={id}
        currentLesson={currentLesson}
        currentTimestamp={currentTimestamp}
        notes={enrollment?.notes || []}
        isOpen={notesOpen}
        onClose={() => setNotesOpen(false)}
        onNotesUpdated={(updatedNotes) => {
          setEnrollment((prev) => ({ ...prev, notes: updatedNotes }));
        }}
      />
    </div>
  );
};
