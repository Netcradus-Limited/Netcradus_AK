import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { academyService } from '../services/academyService';
import { studentService } from '../services/studentService';
import { certificateService } from '../services/certificateService';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../App';
import QuizPlayer from '../components/learn/QuizPlayer';

export default function Learn() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useApp();

  const [curriculumData, setCurriculumData] = useState(null);
  const [activeLectureId, setActiveLectureId] = useState(null);
  const [activeLecture, setActiveLecture] = useState(null);

  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [userProgress, setUserProgress] = useState(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [loadingCert, setLoadingCert] = useState(false);

  const [loadingCurriculum, setLoadingCurriculum] = useState(true);
  const [loadingLecture, setLoadingLecture] = useState(false);
  const [error, setError] = useState(null);
  const [lectureError, setLectureError] = useState(null);

  // 1. Fetch Course & Curriculum Metadata
  const fetchCurriculum = async () => {
    setLoadingCurriculum(true);
    setError(null);
    try {
      const courses = await academyService.getCourses('all');
      const foundCourse = (courses || []).find(
        (c) => c._id === courseId || c.slug === courseId
      );

      const targetSlug = foundCourse ? foundCourse.slug : courseId;
      const data = await academyService.getPublicCurriculum(targetSlug);
      setCurriculumData(data);

      if (data.userProgress) {
        setUserProgress(data.userProgress);
      }

      // Collect completed lesson IDs from curriculum lessons
      const completedSet = new Set();
      (data.curriculum || []).forEach((mod) => {
        (mod.lessons || []).forEach((les) => {
          if (les.isCompleted) completedSet.add(les._id);
        });
      });
      setCompletedLessonIds(completedSet);

      // Resolve initial active lecture: query param ?lesson= -> continue target -> first lesson
      const paramLessonId = searchParams.get('lesson');
      if (paramLessonId) {
        setActiveLectureId(paramLessonId);
      } else if (data.userProgress && data.userProgress.continueLessonId) {
        setActiveLectureId(data.userProgress.continueLessonId);
      } else {
        const firstModule = data.curriculum && data.curriculum[0];
        const firstLesson = firstModule && firstModule.lessons && firstModule.lessons[0];
        if (firstLesson) {
          setActiveLectureId(firstLesson._id);
        }
      }
    } catch (err) {
      console.error('[Learn] Error loading course curriculum:', err);
      setError(err.message || 'Failed to load course curriculum.');
    } finally {
      setLoadingCurriculum(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCurriculum();
    }
  }, [courseId]);

  // 2. Fetch Secure Lecture Content whenever activeLectureId changes
  const fetchLectureContent = async (lectureId) => {
    if (!lectureId) return;
    setLoadingLecture(true);
    setLectureError(null);
    try {
      const data = await studentService.getLectureContent(lectureId);
      setActiveLecture(data);

      // Update last accessed lesson on backend if authenticated student
      if (isAuthenticated && user?.role === 'student' && courseId) {
        studentService.updateLastAccessed(courseId, lectureId).catch(() => {});
      }
    } catch (err) {
      console.error('[Learn] Lecture Content Error:', err);
      setActiveLecture(null);
      setLectureError(err.message || 'Unable to access this lecture.');
    } finally {
      setLoadingLecture(false);
    }
  };

  useEffect(() => {
    if (activeLectureId) {
      fetchLectureContent(activeLectureId);
    }
  }, [activeLectureId]);

  // 3. Handle Mark Lecture as Complete
  const handleMarkComplete = async () => {
    if (!activeLectureId || markingComplete) return;

    if (!isAuthenticated) {
      showToast('Please log in to track your learning progress.');
      navigate('/login');
      return;
    }

    setMarkingComplete(true);
    try {
      const result = await studentService.markLessonComplete(activeLectureId);
      showToast('Lesson marked as complete! 🎉');

      // Update local completed set
      setCompletedLessonIds((prev) => new Set([...prev, activeLectureId]));

      // Update user progress summary
      setUserProgress((prev) => ({
        ...prev,
        completedLessonsCount: result.completedLessonsCount,
        totalLessons: result.totalLessons,
        progressPercentage: result.progressPercentage,
        status: result.status,
        continueLessonId: result.continueLessonId,
      }));

      // Auto-advance to next lesson if available
      if (result.continueLessonId && result.continueLessonId !== activeLectureId) {
        setActiveLectureId(result.continueLessonId);
      }
    } catch (err) {
      console.error('[Learn] Mark Complete Error:', err);
      showToast(err.message || 'Failed to mark lesson complete.');
    } finally {
      setMarkingComplete(false);
    }
  };

  const isCourse100Completed = Boolean(userProgress && userProgress.progressPercentage === 100);

  useEffect(() => {
    if (isCourse100Completed && courseId) {
      certificateService.getMyCourseCertificate(courseId)
        .then((data) => setCertificate(data))
        .catch(() => setCertificate(null));
    }
  }, [isCourse100Completed, courseId]);

  const handleCertificateAction = async () => {
    if (certificate && certificate.certificateId) {
      navigate(`/certificate?id=${certificate.certificateId}`);
      return;
    }

    setLoadingCert(true);
    try {
      const issued = await certificateService.issueCertificate(courseId);
      setCertificate(issued);
      showToast('Certificate claimed successfully! 🎉');
      navigate(`/certificate?id=${issued.certificateId}`);
    } catch (certErr) {
      showToast(certErr.message || 'Failed to claim certificate.');
    } finally {
      setLoadingCert(false);
    }
  };

  if (loadingCurriculum) {
    return (
      <div className="learn-page" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="admin-spinner"></div>
        <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>Loading Learning Portal...</p>
      </div>
    );
  }

  if (error || !curriculumData) {
    return (
      <div className="learn-page" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="admin-error-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <i className="fa-solid fa-triangle-exclamation"></i>
          <h3>Unable to Access Course</h3>
          <p>{error || 'Course curriculum not found.'}</p>
          <Link to="/my-courses" className="btn btn-cyan" style={{ marginTop: '15px' }}>
            <i className="fa-solid fa-arrow-left"></i> Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  const { course, curriculum } = curriculumData;
  const isCurrentLessonCompleted = activeLectureId && completedLessonIds.has(activeLectureId);

  // Handle quiz passed callback
  const handleQuizPassed = (result) => {
    if (activeLectureId) {
      setCompletedLessonIds((prev) => new Set([...prev, activeLectureId]));
    }
    if (result?.courseProgress) {
      setUserProgress((prev) => ({
        ...prev,
        ...result.courseProgress,
      }));
    }
  };

  // Flattened lessons list for continuous learning navigation
  const allLessons = (curriculum || []).flatMap((mod) => mod.lessons || []);
  const currentLessonIndex = allLessons.findIndex((l) => l._id === activeLectureId);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex !== -1 && currentLessonIndex < allLessons.length - 1
    ? allLessons[currentLessonIndex + 1]
    : null;

  const handleNextLesson = () => {
    if (nextLesson) {
      setActiveLectureId(nextLesson._id);
    }
  };

  return (
    <div className="learn-page" style={{ background: 'var(--bg-dark)', minHeight: 'calc(100vh - 80px)' }}>
      {/* TOP LEARNING HEADER & PROGRESS BAR */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-glow)', padding: '14px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/my-courses" className="btn btn-sm btn-outline-cyan">
            <i className="fa-solid fa-arrow-left"></i> My Courses
          </Link>
          <h2 style={{ color: 'var(--white)', fontSize: '1.25rem', margin: 0 }}>
            {course.title}
          </h2>
        </div>

        {userProgress && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Course Progress: <strong style={{ color: 'var(--cyan-primary)' }}>{userProgress.progressPercentage}%</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {userProgress.completedLessonsCount} / {userProgress.totalLessons} Lessons
              </div>
            </div>
            <div style={{ width: '120px', height: '8px', background: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: `${userProgress.progressPercentage}%`, height: '100%', background: 'var(--cyan-primary)', transition: 'var(--transition)' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* 100% COURSE COMPLETION BANNER */}
      {isCourse100Completed && (
        <div style={{ background: 'rgba(46, 213, 115, 0.12)', borderBottom: '1px solid rgba(46, 213, 115, 0.3)', padding: '12px 30px', color: '#2ed573', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', fontSize: '0.92rem', fontWeight: 'bold' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-graduation-cap" style={{ fontSize: '1.2rem' }}></i>
            Congratulations! You have completed 100% of this course!
          </div>
          <button
            type="button"
            onClick={handleCertificateAction}
            disabled={loadingCert}
            className="btn btn-sm btn-cyan"
            style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {loadingCert ? (
              <span><i className="fa-solid fa-spinner fa-spin"></i> Processing...</span>
            ) : (
              <span>
                <i className="fa-solid fa-award"></i> {certificate ? 'View Certificate' : 'Claim Certificate'}
              </span>
            )}
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN LMS LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', minHeight: 'calc(100vh - 145px)' }}>
        
        {/* LEFT SIDEBAR: CURRICULUM TREE WITH REAL PROGRESS INDICATORS */}
        <div style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border-subtle)', padding: '20px', overflowY: 'auto' }}>
          <h4 style={{ color: 'var(--white)', marginBottom: '15px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-list-check" style={{ color: 'var(--cyan-primary)' }}></i> Course Content
          </h4>

          {curriculum.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No modules published yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {curriculum.map((mod) => (
                <div key={mod._id}>
                  <div style={{ color: 'var(--cyan-primary)', fontSize: '0.82rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    {mod.title}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {(mod.lessons || []).map((les) => {
                      const isActive = activeLectureId === les._id;
                      const isCompleted = completedLessonIds.has(les._id);

                      return (
                        <button
                          key={les._id}
                          onClick={() => setActiveLectureId(les._id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: isActive ? 'rgba(245, 158, 11, 0.15)' : isCompleted ? 'rgba(46, 213, 115, 0.05)' : 'transparent',
                            border: isActive ? '1px solid var(--border-glow)' : '1px solid transparent',
                            color: isActive ? 'var(--white)' : isCompleted ? 'var(--text-main)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '0.88rem',
                            transition: 'var(--transition)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                            {isCompleted ? (
                              <i className="fa-solid fa-circle-check" style={{ color: '#2ed573' }}></i>
                            ) : les.type === 'quiz' ? (
                              <i className="fa-solid fa-clipboard-question" style={{ color: isActive ? 'var(--cyan-primary)' : 'var(--text-muted)', fontSize: '0.85rem' }}></i>
                            ) : isActive ? (
                              <i className="fa-solid fa-play" style={{ color: 'var(--cyan-primary)', fontSize: '0.8rem' }}></i>
                            ) : (
                              <i className="fa-regular fa-circle" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}></i>
                            )}
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{les.title}</span>
                          </div>
                          {les.isFreePreview ? (
                            <span style={{ fontSize: '0.68rem', color: '#2ed573', border: '1px solid #2ed573', padding: '1px 5px', borderRadius: '3px' }}>FREE</span>
                          ) : les.isLocked ? (
                            <i className="fa-solid fa-lock" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}></i>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT MAIN VIEWER AREA */}
        <div style={{ padding: '30px', overflowY: 'auto' }}>
          {loadingLecture ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div className="admin-spinner"></div>
              <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>Fetching secure lecture content...</p>
            </div>
          ) : lectureError ? (
            /* LOCKED / ACCESS DENIED STATE */
            <div style={{ maxWidth: '650px', margin: '40px auto', background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '40px', textAlign: 'center' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(235, 77, 75, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(235, 77, 75, 0.3)' }}>
                <i className="fa-solid fa-lock" style={{ fontSize: '2rem', color: '#eb4d4b' }}></i>
              </div>
              <h3 style={{ color: 'var(--white)', fontSize: '1.4rem', marginBottom: '10px' }}>Content Locked</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.6' }}>
                {lectureError}
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <Link to="/courses" className="btn btn-cyan">
                  <i className="fa-solid fa-compass"></i> Browse Courses Catalog
                </Link>
                {!isAuthenticated && (
                  <Link to="/login" className="btn btn-outline-cyan">
                    <i className="fa-solid fa-user"></i> Log In
                  </Link>
                )}
              </div>
            </div>
          ) : activeLecture ? (
            activeLecture.type === 'quiz' ? (
              /* INTERACTIVE QUIZ ASSESSMENT PLAYER */
              <QuizPlayer
                lecture={activeLecture}
                isCompleted={isCurrentLessonCompleted}
                onQuizPassed={handleQuizPassed}
                onNextLesson={handleNextLesson}
                hasNextLesson={Boolean(nextLesson)}
              />
            ) : (
              /* STANDARD LECTURE CONTENT VIEWER (VIDEO / LAB / TEXT / PDF) */
              <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* VIDEO PLAYER CONTAINER */}
                {(activeLecture.type === 'video' || activeLecture.type === 'lab_video') && (
                  <div style={{ background: '#000', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-glow)', marginBottom: '25px', boxShadow: 'var(--shadow-glow)' }}>
                    {activeLecture.video ? (
                      <video controls controlsList="nodownload" style={{ width: '100%', maxHeight: '560px', display: 'block' }} src={activeLecture.video}>
                        Your browser does not support HTML5 video playback.
                      </video>
                    ) : (
                      <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-video-slash" style={{ fontSize: '2.5rem', marginBottom: '12px' }}></i>
                        <p>No video URL attached to this lecture yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* LECTURE TITLE, COMPLETION ACTION & DETAILS */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '30px', marginBottom: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--cyan-primary)', fontSize: '0.75rem', border: '1px solid var(--border-glow)', textTransform: 'uppercase' }}>
                        {activeLecture.type}
                      </span>
                      {activeLecture.preview && (
                        <span style={{ color: '#2ed573', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          <i className="fa-solid fa-eye"></i> FREE PREVIEW
                        </span>
                      )}
                    </div>

                    {/* MARK AS COMPLETE / COMPLETED BUTTON */}
                    {isAuthenticated && user?.role === 'student' && (
                      <button
                        onClick={handleMarkComplete}
                        disabled={isCurrentLessonCompleted || markingComplete}
                        className={`btn btn-sm ${isCurrentLessonCompleted ? 'btn-outline-green' : 'btn-cyan'}`}
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.88rem',
                          background: isCurrentLessonCompleted ? 'rgba(46, 213, 115, 0.15)' : undefined,
                          color: isCurrentLessonCompleted ? '#2ed573' : undefined,
                          borderColor: isCurrentLessonCompleted ? '#2ed573' : undefined,
                        }}
                      >
                        {markingComplete ? (
                          <span><i className="fa-solid fa-spinner fa-spin"></i> Saving...</span>
                        ) : isCurrentLessonCompleted ? (
                          <span><i className="fa-solid fa-circle-check"></i> Completed</span>
                        ) : (
                          <span><i className="fa-regular fa-circle-check"></i> Mark as Complete</span>
                        )}
                      </button>
                    )}
                  </div>

                  <h1 style={{ color: 'var(--white)', fontSize: '1.8rem', marginBottom: '12px' }}>
                    {activeLecture.title}
                  </h1>

                  {activeLecture.description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
                      {activeLecture.description}
                    </p>
                  )}
                </div>

                {/* TEXT CONTENT READING */}
                {activeLecture.type === 'text' && activeLecture.content && (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '30px', marginBottom: '25px' }}>
                    <h3 style={{ color: 'var(--white)', marginBottom: '15px', fontSize: '1.2rem' }}>
                      <i className="fa-solid fa-book-open" style={{ color: 'var(--cyan-primary)', marginRight: '8px' }}></i> Lesson Reading Notes
                    </h3>
                    <div style={{ color: 'var(--text-muted)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                      {activeLecture.content}
                    </div>
                  </div>
                )}

                {/* DOWNLOADABLE RESOURCES */}
                {activeLecture.resources && activeLecture.resources.length > 0 && (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '30px', marginBottom: '25px' }}>
                    <h3 style={{ color: 'var(--white)', marginBottom: '15px', fontSize: '1.2rem' }}>
                      <i className="fa-solid fa-download" style={{ color: 'var(--cyan-primary)', marginRight: '8px' }}></i> Practical Lab Resources & Attachments
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {activeLecture.resources.map((res, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-dark)', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className="fa-solid fa-file-pdf" style={{ color: 'var(--cyan-primary)', fontSize: '1.2rem' }}></i>
                            <span style={{ color: 'var(--white)', fontSize: '0.92rem' }}>{res.title || `Resource ${idx + 1}`}</span>
                          </div>
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-cyan">
                            <i className="fa-solid fa-download"></i> Download File
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PREVIOUS / NEXT LESSON NAVIGATION CONTROLS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '10px' }}>
                  {prevLesson ? (
                    <button
                      onClick={() => setActiveLectureId(prevLesson._id)}
                      className="btn btn-sm btn-outline-cyan"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <i className="fa-solid fa-arrow-left"></i> Previous: {prevLesson.title}
                    </button>
                  ) : <div />}

                  {nextLesson && (
                    <button
                      onClick={() => setActiveLectureId(nextLesson._id)}
                      className="btn btn-sm btn-cyan"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      Next: {nextLesson.title} <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  )}
                </div>

              </div>
            )
          ) : (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a lecture from the curriculum sidebar on the left.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

