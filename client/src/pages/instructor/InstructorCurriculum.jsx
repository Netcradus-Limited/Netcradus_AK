import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { instructorService } from '../../services/instructorService';

export default function InstructorCurriculum() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Module Modal state
  const [moduleModal, setModuleModal] = useState({
    isOpen: false,
    isEdit: false,
    moduleId: null,
    title: '',
    description: '',
    published: true,
  });

  // Lecture Modal state
  const [lectureModal, setLectureModal] = useState({
    isOpen: false,
    isEdit: false,
    moduleId: null,
    lectureId: null,
    title: '',
    type: 'video',
    description: '',
    durationSeconds: 0,
    preview: false,
    published: true,
    video: '',
    content: '',
    pdf: '',
    quiz: [],
  });

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchCurriculum = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await instructorService.getCurriculum(courseId);
      setCourse(data.course);
      setCurriculum(data.curriculum || []);
    } catch (err) {
      console.error('[InstructorCurriculum] Fetch error:', err);
      setError(err.message || 'Failed to load course curriculum.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, [courseId]);

  // ==========================================
  // MODULE ACTIONS
  // ==========================================
  const handleOpenModuleModal = (moduleToEdit = null) => {
    setModalError(null);
    if (moduleToEdit) {
      setModuleModal({
        isOpen: true,
        isEdit: true,
        moduleId: moduleToEdit._id,
        title: moduleToEdit.title || '',
        description: moduleToEdit.description || '',
        published: moduleToEdit.published !== false,
      });
    } else {
      setModuleModal({
        isOpen: true,
        isEdit: false,
        moduleId: null,
        title: '',
        description: '',
        published: true,
      });
    }
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!moduleModal.title.trim()) {
      setModalError('Module title is required.');
      return;
    }

    setSaving(true);
    setModalError(null);
    try {
      if (moduleModal.isEdit) {
        await instructorService.updateModule(moduleModal.moduleId, {
          title: moduleModal.title.trim(),
          description: moduleModal.description.trim(),
          published: moduleModal.published,
        });
      } else {
        await instructorService.createModule(courseId, {
          title: moduleModal.title.trim(),
          description: moduleModal.description.trim(),
          published: moduleModal.published,
        });
      }
      setModuleModal((prev) => ({ ...prev, isOpen: false }));
      await fetchCurriculum();
    } catch (err) {
      setModalError(err.message || 'Failed to save module.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (moduleId, title) => {
    if (!window.confirm(`Are you sure you want to delete module "${title}" and all its lessons?`)) {
      return;
    }
    try {
      await instructorService.deleteModule(moduleId);
      await fetchCurriculum();
    } catch (err) {
      alert(err.message || 'Failed to delete module.');
    }
  };

  const handleReorderModule = async (moduleId, direction) => {
    try {
      await instructorService.reorderModule(moduleId, direction);
      await fetchCurriculum();
    } catch (err) {
      alert(err.message || `Failed to move module ${direction}.`);
    }
  };

  // ==========================================
  // LECTURE ACTIONS
  // ==========================================
  const handleOpenLectureModal = (moduleId, lectureToEdit = null) => {
    setModalError(null);
    if (lectureToEdit) {
      setLectureModal({
        isOpen: true,
        isEdit: true,
        moduleId,
        lectureId: lectureToEdit._id,
        title: lectureToEdit.title || '',
        type: lectureToEdit.type || 'video',
        description: lectureToEdit.description || '',
        durationSeconds: lectureToEdit.durationSeconds || 0,
        preview: Boolean(lectureToEdit.preview),
        published: lectureToEdit.published !== false,
        video: lectureToEdit.video || '',
        content: lectureToEdit.content || '',
        pdf: lectureToEdit.pdf || '',
        quiz: Array.isArray(lectureToEdit.quiz) ? JSON.parse(JSON.stringify(lectureToEdit.quiz)) : [],
      });
    } else {
      setLectureModal({
        isOpen: true,
        isEdit: false,
        moduleId,
        lectureId: null,
        title: '',
        type: 'video',
        description: '',
        durationSeconds: 0,
        preview: false,
        published: true,
        video: '',
        content: '',
        pdf: '',
        quiz: [],
      });
    }
  };

  const handleSaveLecture = async (e) => {
    e.preventDefault();
    if (!lectureModal.title.trim()) {
      setModalError('Lecture title is required.');
      return;
    }

    // Quiz validations
    if (lectureModal.type === 'quiz') {
      if (lectureModal.quiz.length === 0) {
        setModalError('A quiz assessment must have at least one question.');
        return;
      }
      for (let i = 0; i < lectureModal.quiz.length; i += 1) {
        const q = lectureModal.quiz[i];
        if (!q.question.trim()) {
          setModalError(`Question #${i + 1} title cannot be blank.`);
          return;
        }
        if (q.options.length < 2) {
          setModalError(`Question #${i + 1} must have at least 2 options.`);
          return;
        }
        for (let j = 0; j < q.options.length; j += 1) {
          if (!q.options[j].trim()) {
            setModalError(`Question #${i + 1}, Option ${String.fromCharCode(65 + j)} cannot be empty.`);
            return;
          }
        }
        if (q.correctOptionIndex === undefined || q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) {
          setModalError(`Please select the correct answer for Question #${i + 1}.`);
          return;
        }
      }
    }

    setSaving(true);
    setModalError(null);
    try {
      const payload = {
        title: lectureModal.title.trim(),
        type: lectureModal.type,
        description: lectureModal.description.trim(),
        durationSeconds: Number(lectureModal.durationSeconds) || 0,
        preview: Boolean(lectureModal.preview),
        published: Boolean(lectureModal.published),
        video: lectureModal.video.trim(),
        content: lectureModal.content.trim(),
        pdf: lectureModal.pdf.trim(),
        quiz: lectureModal.type === 'quiz' ? lectureModal.quiz : [],
      };

      if (lectureModal.isEdit) {
        await instructorService.updateLecture(lectureModal.lectureId, payload);
      } else {
        await instructorService.createLecture(lectureModal.moduleId, payload);
      }

      setLectureModal((prev) => ({ ...prev, isOpen: false }));
      await fetchCurriculum();
    } catch (err) {
      setModalError(err.message || 'Failed to save lecture.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLecture = async (lectureId, title) => {
    if (!window.confirm(`Are you sure you want to delete lecture "${title}"?`)) {
      return;
    }
    try {
      await instructorService.deleteLecture(lectureId);
      await fetchCurriculum();
    } catch (err) {
      alert(err.message || 'Failed to delete lecture.');
    }
  };

  const handleReorderLecture = async (lectureId, direction) => {
    try {
      await instructorService.reorderLecture(lectureId, direction);
      await fetchCurriculum();
    } catch (err) {
      alert(err.message || `Failed to move lecture ${direction}.`);
    }
  };

  // ==========================================
  // QUIZ BUILDER HELPERS
  // ==========================================
  const handleAddQuestion = () => {
    setLectureModal((prev) => ({
      ...prev,
      quiz: [
        ...prev.quiz,
        {
          question: '',
          options: ['', ''],
          correctOptionIndex: 0,
        },
      ],
    }));
  };

  const handleRemoveQuestion = (qIdx) => {
    setLectureModal((prev) => ({
      ...prev,
      quiz: prev.quiz.filter((_, idx) => idx !== qIdx),
    }));
  };

  const handleQuestionTextChange = (qIdx, text) => {
    setLectureModal((prev) => {
      const updatedQuiz = [...prev.quiz];
      updatedQuiz[qIdx].question = text;
      return { ...prev, quiz: updatedQuiz };
    });
  };

  const handleOptionTextChange = (qIdx, optIdx, text) => {
    setLectureModal((prev) => {
      const updatedQuiz = [...prev.quiz];
      const updatedOptions = [...updatedQuiz[qIdx].options];
      updatedOptions[optIdx] = text;
      updatedQuiz[qIdx].options = updatedOptions;
      return { ...prev, quiz: updatedQuiz };
    });
  };

  const handleAddOption = (qIdx) => {
    setLectureModal((prev) => {
      const updatedQuiz = [...prev.quiz];
      updatedQuiz[qIdx].options = [...updatedQuiz[qIdx].options, ''];
      return { ...prev, quiz: updatedQuiz };
    });
  };

  const handleRemoveOption = (qIdx, optIdx) => {
    setLectureModal((prev) => {
      const updatedQuiz = [...prev.quiz];
      if (updatedQuiz[qIdx].options.length <= 2) {
        alert('A question must have at least 2 options.');
        return prev;
      }
      const updatedOptions = updatedQuiz[qIdx].options.filter((_, idx) => idx !== optIdx);
      updatedQuiz[qIdx].options = updatedOptions;
      if (updatedQuiz[qIdx].correctOptionIndex >= updatedOptions.length) {
        updatedQuiz[qIdx].correctOptionIndex = 0;
      }
      return { ...prev, quiz: updatedQuiz };
    });
  };

  const handleSelectCorrectOption = (qIdx, optIdx) => {
    setLectureModal((prev) => {
      const updatedQuiz = [...prev.quiz];
      updatedQuiz[qIdx].correctOptionIndex = optIdx;
      return { ...prev, quiz: updatedQuiz };
    });
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-spinner"></div>
        <p>Loading course curriculum...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error-card">
        <i className="fa-solid fa-triangle-exclamation"></i>
        <h3>Failed to Load Curriculum</h3>
        <p>{error}</p>
        <Link to="/instructor/courses" className="btn-admin-primary">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Breadcrumb & Controls */}
      <div style={{ marginBottom: '20px' }}>
        <Link to={`/instructor/courses/${courseId}`} style={{ color: 'var(--cyan-primary)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <i className="fa-solid fa-arrow-left"></i> Back to Course Overview
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--white)', margin: 0 }}>
              Curriculum Builder: {course?.title}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0' }}>
              Organize your syllabus modules, lectures, reading notes, and interactive quizzes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenModuleModal(null)}
            className="btn-admin-primary"
          >
            <i className="fa-solid fa-folder-plus"></i> Add Module
          </button>
        </div>
      </div>

      {/* Curriculum Modules List */}
      {curriculum.length === 0 ? (
        <div className="admin-card" style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-layer-group" style={{ fontSize: '2.5rem', color: 'var(--cyan-primary)', marginBottom: '15px', display: 'block' }}></i>
          <h3 style={{ color: 'var(--white)', marginBottom: '8px' }}>No Modules Created Yet</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            Get started by creating your first syllabus module, then add video lectures, reading notes, or quizzes.
          </p>
          <button
            type="button"
            onClick={() => handleOpenModuleModal(null)}
            className="btn-admin-primary"
          >
            <i className="fa-solid fa-folder-plus"></i> Create Module
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {curriculum.map((mod, modIdx) => (
            <div
              key={mod._id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              {/* Module Header */}
              <div
                style={{
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--cyan-primary)', letterSpacing: '0.5px' }}>
                      MODULE {modIdx + 1}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--white)', margin: 0 }}>
                      {mod.title}
                    </h3>
                    {!mod.published && (
                      <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255, 165, 2, 0.15)', color: '#ffa502' }}>
                        Draft
                      </span>
                    )}
                  </div>
                  {mod.description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '4px 0 0' }}>
                      {mod.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleReorderModule(mod._id, 'up')}
                    disabled={modIdx === 0}
                    className="btn-admin-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    title="Move Module Up"
                  >
                    <i className="fa-solid fa-arrow-up"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorderModule(mod._id, 'down')}
                    disabled={modIdx === curriculum.length - 1}
                    className="btn-admin-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    title="Move Module Down"
                  >
                    <i className="fa-solid fa-arrow-down"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenModuleModal(mod)}
                    className="btn-admin-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                  >
                    <i className="fa-solid fa-pen"></i> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteModule(mod._id, mod.title)}
                    className="btn-admin-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.8rem', color: '#eb4d4b' }}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenLectureModal(mod._id, null)}
                    className="btn-admin-primary"
                    style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                  >
                    <i className="fa-solid fa-plus"></i> Add Lesson
                  </button>
                </div>
              </div>

              {/* Module Lessons List */}
              <div style={{ padding: '12px 20px' }}>
                {!mod.lessons || mod.lessons.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No lectures in this module yet. Click "+ Add Lesson" to create one.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {mod.lessons.map((les, lesIdx) => (
                      <div
                        key={les._id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          flexWrap: 'wrap',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: '20px' }}>
                            {lesIdx + 1}.
                          </span>
                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              background: les.type === 'quiz' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                              color: les.type === 'quiz' ? 'var(--cyan-primary)' : 'var(--text-main)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.85rem',
                            }}
                          >
                            {les.type === 'quiz' ? (
                              <i className="fa-solid fa-clipboard-question"></i>
                            ) : les.type === 'video' || les.type === 'lab_video' ? (
                              <i className="fa-solid fa-play"></i>
                            ) : les.type === 'pdf' ? (
                              <i className="fa-solid fa-file-pdf"></i>
                            ) : (
                              <i className="fa-solid fa-file-lines"></i>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.9rem' }}>
                              {les.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Type: <span style={{ textTransform: 'capitalize' }}>{les.type}</span>
                              {les.type === 'quiz' && ` • ${les.quiz ? les.quiz.length : 0} Questions`}
                              {les.preview && ' • (Free Preview)'}
                              {!les.published && ' • (Draft)'}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleReorderLecture(les._id, 'up')}
                            disabled={lesIdx === 0}
                            className="btn-admin-secondary"
                            style={{ padding: '3px 6px', fontSize: '0.75rem' }}
                            title="Move Lesson Up"
                          >
                            <i className="fa-solid fa-arrow-up"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReorderLecture(les._id, 'down')}
                            disabled={lesIdx === mod.lessons.length - 1}
                            className="btn-admin-secondary"
                            style={{ padding: '3px 6px', fontSize: '0.75rem' }}
                            title="Move Lesson Down"
                          >
                            <i className="fa-solid fa-arrow-down"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenLectureModal(mod._id, les)}
                            className="btn-admin-secondary"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          >
                            <i className="fa-solid fa-pen"></i> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLecture(les._id, les.title)}
                            className="btn-admin-secondary"
                            style={{ padding: '3px 6px', fontSize: '0.75rem', color: '#eb4d4b' }}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODULE MODAL */}
      {/* ======================================================== */}
      {moduleModal.isOpen && (
        <div className="admin-modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="admin-modal" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '520px', padding: '24px' }}>
            <h3 style={{ color: 'var(--white)', margin: '0 0 16px', fontSize: '1.2rem' }}>
              {moduleModal.isEdit ? 'Edit Curriculum Module' : 'Create New Module'}
            </h3>

            {modalError && (
              <div style={{ color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '12px' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveModule}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Module Title *
                </label>
                <input
                  type="text"
                  value={moduleModal.title}
                  onChange={(e) => setModuleModal({ ...moduleModal, title: e.target.value })}
                  placeholder="e.g. Module 1: Reconnaissance & Intelligence Gathering"
                  required
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Module Description (Optional)
                </label>
                <textarea
                  value={moduleModal.description}
                  onChange={(e) => setModuleModal({ ...moduleModal, description: e.target.value })}
                  rows={3}
                  placeholder="Summary of topics covered in this module..."
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="module-published"
                  checked={moduleModal.published}
                  onChange={(e) => setModuleModal({ ...moduleModal, published: e.target.checked })}
                  style={{ accentColor: 'var(--cyan-primary)' }}
                />
                <label htmlFor="module-published" style={{ color: 'var(--white)', fontSize: '0.85rem', cursor: 'pointer' }}>
                  Published (Visible to enrolled students)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModuleModal({ ...moduleModal, isOpen: false })}
                  className="btn-admin-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* LECTURE & QUIZ MODAL */}
      {/* ======================================================== */}
      {lectureModal.isOpen && (
        <div className="admin-modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div
            className="admin-modal"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glow)',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              maxWidth: lectureModal.type === 'quiz' ? '750px' : '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
            }}
          >
            <h3 style={{ color: 'var(--white)', margin: '0 0 16px', fontSize: '1.2rem' }}>
              {lectureModal.isEdit ? 'Edit Lesson' : 'Add New Lesson'}
            </h3>

            {modalError && (
              <div style={{ background: 'rgba(235, 77, 75, 0.15)', border: '1px solid #eb4d4b', color: '#ff6b6b', padding: '10px 12px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '14px' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveLecture}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    value={lectureModal.title}
                    onChange={(e) => setLectureModal({ ...lectureModal, title: e.target.value })}
                    required
                    placeholder="e.g. 1.2 Passive Reconnaissance Techniques"
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Type *
                  </label>
                  <select
                    value={lectureModal.type}
                    onChange={(e) => setLectureModal({ ...lectureModal, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  >
                    <option value="video">Video Lecture</option>
                    <option value="lab_video">Lab Demo Video</option>
                    <option value="text">Reading Notes</option>
                    <option value="pdf">PDF Lab Manual</option>
                    <option value="quiz">Interactive Quiz</option>
                  </select>
                </div>
              </div>

              {/* Conditional Inputs based on Lesson Type */}
              {(lectureModal.type === 'video' || lectureModal.type === 'lab_video') && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Video URL (MP4 Stream Link)
                  </label>
                  <input
                    type="text"
                    value={lectureModal.video}
                    onChange={(e) => setLectureModal({ ...lectureModal, video: e.target.value })}
                    placeholder="https://... or /videos/lecture-1.mp4"
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                </div>
              )}

              {lectureModal.type === 'text' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Lesson Content Notes
                  </label>
                  <textarea
                    value={lectureModal.content}
                    onChange={(e) => setLectureModal({ ...lectureModal, content: e.target.value })}
                    rows={6}
                    placeholder="Paste comprehensive reading notes, code snippets, or lab instructions..."
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.9rem', resize: 'vertical' }}
                  />
                </div>
              )}

              {lectureModal.type === 'pdf' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    PDF Manual URL
                  </label>
                  <input
                    type="text"
                    value={lectureModal.pdf}
                    onChange={(e) => setLectureModal({ ...lectureModal, pdf: e.target.value })}
                    placeholder="https://.../guide.pdf"
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                </div>
              )}

              {/* ======================================================== */}
              {/* SECTION 10: QUIZ ASSESSMENT BUILDER */}
              {/* ======================================================== */}
              {lectureModal.type === 'quiz' && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ color: 'var(--cyan-primary)', fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fa-solid fa-list-check"></i>
                      Quiz Questions ({lectureModal.quiz.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="btn-admin-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    >
                      <i className="fa-solid fa-plus"></i> Add Question
                    </button>
                  </div>

                  {lectureModal.quiz.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', fontSize: '0.85rem' }}>
                      No questions configured. Click "+ Add Question" to create one.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {lectureModal.quiz.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          style={{
                            padding: '14px',
                            background: 'rgba(0,0,0,0.25)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--cyan-primary)' }}>
                              Question #{qIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              style={{ background: 'none', border: 'none', color: '#eb4d4b', cursor: 'pointer', fontSize: '0.8rem' }}
                              title="Delete Question"
                            >
                              <i className="fa-solid fa-trash"></i> Delete Question
                            </button>
                          </div>

                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                            placeholder="Enter question text here..."
                            style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.88rem', marginBottom: '10px' }}
                          />

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                            Options (Choose the radio button for the correct answer):
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="radio"
                                  name={`correct-opt-${qIdx}`}
                                  checked={q.correctOptionIndex === optIdx}
                                  onChange={() => handleSelectCorrectOption(qIdx, optIdx)}
                                  title="Mark as correct answer"
                                  style={{ accentColor: '#2ed573', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', width: '18px' }}>
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                                  placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                  style={{ flex: 1, padding: '6px 10px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                                />
                                {q.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(qIdx, optIdx)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                                    title="Remove option"
                                  >
                                    <i className="fa-solid fa-xmark"></i>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddOption(qIdx)}
                            className="btn-admin-secondary"
                            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          >
                            <i className="fa-solid fa-plus"></i> Add Option
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Publication & Preview Checkboxes */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', marginTop: '14px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--white)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={lectureModal.preview}
                    onChange={(e) => setLectureModal({ ...lectureModal, preview: e.target.checked })}
                    style={{ accentColor: 'var(--cyan-primary)' }}
                  />
                  Free Preview (Publicly accessible)
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--white)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={lectureModal.published}
                    onChange={(e) => setLectureModal({ ...lectureModal, published: e.target.checked })}
                    style={{ accentColor: 'var(--cyan-primary)' }}
                  />
                  Published
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setLectureModal({ ...lectureModal, isOpen: false })}
                  className="btn-admin-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
