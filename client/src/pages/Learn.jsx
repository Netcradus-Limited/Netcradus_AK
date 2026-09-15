import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { academyService } from '../services/academyService';
import { studentService } from '../services/studentService';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../App';

export default function Learn() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useApp();

  const [curriculumData, setCurriculumData] = useState(null);
  const [activeLectureId, setActiveLectureId] = useState(null);
  const [activeLecture, setActiveLecture] = useState(null);

  const [loadingCurriculum, setLoadingCurriculum] = useState(true);
  const [loadingLecture, setLoadingLecture] = useState(false);
  const [error, setError] = useState(null);
  const [lectureError, setLectureError] = useState(null);

  // 1. Fetch Course & Curriculum Metadata
  const fetchCurriculum = async () => {
    setLoadingCurriculum(true);
    setError(null);
    try {
      // Find course details first
      const courses = await academyService.getCourses('all');
      const foundCourse = (courses || []).find(
        (c) => c._id === courseId || c.slug === courseId
      );

      const targetSlug = foundCourse ? foundCourse.slug : courseId;
      const data = await academyService.getPublicCurriculum(targetSlug);
      setCurriculumData(data);

      // Automatically select first available lecture
      const firstModule = data.curriculum && data.curriculum[0];
      const firstLesson = firstModule && firstModule.lessons && firstModule.lessons[0];
      if (firstLesson) {
        setActiveLectureId(firstLesson._id);
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

  return (
    <div className="learn-page" style={{ background: 'var(--bg-dark)', minHeight: 'calc(100vh - 80px)' }}>
      {/* TOP LEARNING HEADER */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-glow)', padding: '16px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/my-courses" className="btn btn-sm btn-outline-cyan">
            <i className="fa-solid fa-arrow-left"></i> My Courses
          </Link>
          <h2 style={{ color: 'var(--white)', fontSize: '1.25rem', margin: 0 }}>
            {course.title}
          </h2>
        </div>
        <span className="badge" style={{ background: 'rgba(0, 210, 255, 0.12)', color: 'var(--cyan-primary)', fontSize: '0.8rem', border: '1px solid var(--border-glow)' }}>
          ACADEMY LEARNING PORTAL
        </span>
      </div>

      {/* MAIN TWO-COLUMN LMS LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', minHeight: 'calc(100vh - 145px)' }}>
        
        {/* LEFT SIDEBAR: CURRICULUM TREE */}
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
                            background: isActive ? 'rgba(0, 210, 255, 0.15)' : 'transparent',
                            border: isActive ? '1px solid var(--border-glow)' : '1px solid transparent',
                            color: isActive ? 'var(--white)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '0.88rem',
                            transition: 'var(--transition)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                            <i className={`fa-solid ${les.type === 'lab_video' ? 'fa-flask' : les.type === 'text' ? 'fa-file-lines' : 'fa-circle-play'}`} style={{ color: isActive ? 'var(--cyan-primary)' : 'inherit' }}></i>
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
            /* LECTURE CONTENT VIEWER */
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

              {/* LECTURE TITLE & DETAILS */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '30px', marginBottom: '25px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge" style={{ background: 'rgba(0, 210, 255, 0.15)', color: 'var(--cyan-primary)', fontSize: '0.75rem', border: '1px solid var(--border-glow)', textTransform: 'uppercase' }}>
                    {activeLecture.type}
                  </span>
                  {activeLecture.preview && (
                    <span style={{ color: '#2ed573', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      <i className="fa-solid fa-eye"></i> FREE PREVIEW
                    </span>
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
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '30px' }}>
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

            </div>
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
