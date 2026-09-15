import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useApp } from '../../App';

export default function AdminCurriculum() {
  const { courseId } = useParams();
  const { showToast } = useApp();

  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Module Modal State
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', published: true });

  // Lecture Modal State
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState(null);
  const [editingLecture, setEditingLecture] = useState(null);
  const [lectureForm, setLectureForm] = useState({
    title: '',
    description: '',
    type: 'video',
    durationSeconds: 600,
    preview: false,
    published: true,
    video: '',
    content: '',
    pdf: '',
    resources: [],
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchCurriculum = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAdminCurriculum(courseId);
      setCourse(data.course);
      setCurriculum(data.curriculum || []);
    } catch (err) {
      console.error('[AdminCurriculum] Fetch error:', err);
      setError(err.message || 'Failed to load curriculum.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCurriculum();
    }
  }, [courseId]);

  // --- MODULE ACTIONS ---
  const handleOpenCreateModule = () => {
    setEditingModule(null);
    setModuleForm({ title: '', description: '', published: true });
    setShowModuleModal(true);
  };

  const handleOpenEditModule = (mod) => {
    setEditingModule(mod);
    setModuleForm({ title: mod.title, description: mod.description || '', published: mod.published });
    setShowModuleModal(true);
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!moduleForm.title.trim()) return;

    setSubmitting(true);
    try {
      if (editingModule) {
        await adminService.updateModule(editingModule._id, moduleForm);
        showToast('Module updated successfully!');
      } else {
        await adminService.createModule(courseId, moduleForm);
        showToast('Module created successfully!');
      }
      setShowModuleModal(false);
      fetchCurriculum();
    } catch (err) {
      showToast(err.message || 'Failed to save module.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (mod) => {
    if (!window.confirm(`Are you sure you want to delete module "${mod.title}" and all its associated lectures?`)) {
      return;
    }
    try {
      await adminService.deleteModule(mod._id);
      showToast('Module deleted successfully!');
      fetchCurriculum();
    } catch (err) {
      showToast(err.message || 'Failed to delete module.');
    }
  };

  const handleReorderModule = async (moduleId, direction) => {
    try {
      await adminService.reorderModule(moduleId, direction);
      fetchCurriculum();
    } catch (err) {
      showToast(err.message || 'Cannot reorder module.');
    }
  };

  // --- LECTURE ACTIONS ---
  const handleOpenCreateLecture = (moduleId) => {
    setTargetModuleId(moduleId);
    setEditingLecture(null);
    setLectureForm({
      title: '',
      description: '',
      type: 'video',
      durationSeconds: 600,
      preview: false,
      published: true,
      video: 'https://www.w3schools.com/html/mov_bbb.mp4',
      content: '',
      pdf: '',
      resources: [],
    });
    setShowLectureModal(true);
  };

  const handleOpenEditLecture = (moduleId, lec) => {
    setTargetModuleId(moduleId);
    setEditingLecture(lec);
    setLectureForm({
      title: lec.title,
      description: lec.description || '',
      type: lec.type || 'video',
      durationSeconds: lec.durationSeconds || 0,
      preview: lec.preview === true,
      published: lec.published !== false,
      video: lec.video || '',
      content: lec.content || '',
      pdf: lec.pdf || '',
      resources: lec.resources || [],
    });
    setShowLectureModal(true);
  };

  const handleSaveLecture = async (e) => {
    e.preventDefault();
    if (!lectureForm.title.trim()) return;

    setSubmitting(true);
    try {
      if (editingLecture) {
        await adminService.updateLecture(editingLecture._id, lectureForm);
        showToast('Lecture updated successfully!');
      } else {
        await adminService.createLecture(targetModuleId, lectureForm);
        showToast('Lecture created successfully!');
      }
      setShowLectureModal(false);
      fetchCurriculum();
    } catch (err) {
      showToast(err.message || 'Failed to save lecture.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLecture = async (lec) => {
    if (!window.confirm(`Delete lecture "${lec.title}"?`)) return;
    try {
      await adminService.deleteLecture(lec._id);
      showToast('Lecture deleted!');
      fetchCurriculum();
    } catch (err) {
      showToast(err.message || 'Failed to delete lecture.');
    }
  };

  const handleReorderLecture = async (lectureId, direction) => {
    try {
      await adminService.reorderLecture(lectureId, direction);
      fetchCurriculum();
    } catch (err) {
      showToast(err.message || 'Cannot reorder lecture.');
    }
  };

  return (
    <div className="admin-curriculum-page" style={{ padding: '30px' }}>
      {/* HEADER & BREADCRUMB */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <Link to="/admin/courses" className="btn btn-sm btn-outline-cyan" style={{ marginBottom: '10px' }}>
            <i className="fa-solid fa-arrow-left"></i> Back to Courses
          </Link>
          <h2 style={{ color: 'var(--white)', fontSize: '1.8rem', margin: 0 }}>
            Curriculum Builder: {course ? course.title : 'Loading...'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage course modules, lectures, lab videos, free previews, and study resources.
          </p>
        </div>

        <button onClick={handleOpenCreateModule} className="btn btn-cyan">
          <i className="fa-solid fa-folder-plus"></i> + Add New Module
        </button>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="admin-loading-container" style={{ padding: '60px', textAlign: 'center' }}>
          <div className="admin-spinner"></div>
          <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>Loading course modules & lectures...</p>
        </div>
      ) : error ? (
        <div className="admin-error-card">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <p>{error}</p>
        </div>
      ) : curriculum.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-glow)' }}>
          <i className="fa-solid fa-layer-group" style={{ fontSize: '3rem', color: 'var(--cyan-primary)', marginBottom: '15px' }}></i>
          <h3 style={{ color: 'var(--white)', marginBottom: '8px' }}>No modules created for this course yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Start building the curriculum structure by adding your first module.</p>
          <button onClick={handleOpenCreateModule} className="btn btn-cyan">
            <i className="fa-solid fa-plus"></i> Create First Module
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {curriculum.map((mod, modIdx) => (
            <div key={mod._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '25px' }}>
              
              {/* MODULE HEADER BAR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span className="badge" style={{ background: 'rgba(0, 210, 255, 0.15)', color: 'var(--cyan-primary)', fontSize: '0.75rem', marginRight: '10px' }}>
                    MODULE {mod.order}
                  </span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--white)' }}>{mod.title}</strong>
                  <span className={`admin-badge ${mod.published ? 'success' : 'warning'}`} style={{ marginLeft: '10px' }}>
                    {mod.published ? 'Published' : 'Draft'}
                  </span>
                  {mod.description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>{mod.description}</p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => handleReorderModule(mod._id, 'up')} disabled={modIdx === 0} className="btn btn-sm btn-outline-cyan" title="Move Up">
                    <i className="fa-solid fa-chevron-up"></i>
                  </button>
                  <button onClick={() => handleReorderModule(mod._id, 'down')} disabled={modIdx === curriculum.length - 1} className="btn btn-sm btn-outline-cyan" title="Move Down">
                    <i className="fa-solid fa-chevron-down"></i>
                  </button>
                  <button onClick={() => handleOpenEditModule(mod)} className="btn btn-sm btn-outline-cyan">
                    <i className="fa-solid fa-pen"></i> Edit
                  </button>
                  <button onClick={() => handleDeleteModule(mod)} className="btn btn-sm btn-outline-red">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                  <button onClick={() => handleOpenCreateLecture(mod._id)} className="btn btn-sm btn-cyan" style={{ marginLeft: '10px' }}>
                    <i className="fa-solid fa-plus"></i> Add Lecture
                  </button>
                </div>
              </div>

              {/* LECTURES LIST */}
              {(!mod.lessons || mod.lessons.length === 0) ? (
                <div style={{ padding: '15px', background: 'var(--bg-dark)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center' }}>
                  No lectures in this module yet. Click "+ Add Lecture" above.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {mod.lessons.map((lec, lecIdx) => (
                    <div key={lec._id} style={{ background: 'var(--bg-dark)', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: 'var(--cyan-primary)', fontSize: '1.1rem' }}>
                          <i className={`fa-solid ${lec.type === 'lab_video' ? 'fa-flask' : lec.type === 'text' ? 'fa-file-lines' : 'fa-circle-play'}`}></i>
                        </span>
                        <div>
                          <strong style={{ color: 'var(--white)', fontSize: '0.98rem' }}>{lec.title}</strong>
                          <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span style={{ textTransform: 'uppercase', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>{lec.type}</span>
                            {lec.durationSeconds > 0 && <span><i className="fa-regular fa-clock"></i> {Math.round(lec.durationSeconds / 60)} mins</span>}
                            {lec.preview && <span style={{ color: '#2ed573', fontWeight: 'bold' }}><i className="fa-solid fa-eye"></i> FREE PREVIEW</span>}
                            {!lec.published && <span style={{ color: 'var(--warning-color)' }}><i className="fa-solid fa-eye-slash"></i> UNPUBLISHED</span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleReorderLecture(lec._id, 'up')} disabled={lecIdx === 0} className="btn btn-sm btn-outline-cyan" title="Move Up">
                          <i className="fa-solid fa-chevron-up"></i>
                        </button>
                        <button onClick={() => handleReorderLecture(lec._id, 'down')} disabled={lecIdx === mod.lessons.length - 1} className="btn btn-sm btn-outline-cyan" title="Move Down">
                          <i className="fa-solid fa-chevron-down"></i>
                        </button>
                        <button onClick={() => handleOpenEditLecture(mod._id, lec)} className="btn btn-sm btn-outline-cyan">
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button onClick={() => handleDeleteLecture(lec)} className="btn btn-sm btn-outline-red">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODULE MODAL */}
      {showModuleModal && (
        <div className="modal-overlay" style={{ display: 'flex', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '30px', maxWidth: '500px', width: '90%' }}>
            <h3 style={{ color: 'var(--white)', marginBottom: '20px' }}>{editingModule ? 'Edit Module' : 'Create Module'}</h3>
            <form onSubmit={handleSaveModule}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Module Title *</label>
                <input type="text" className="form-control" required value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} placeholder="e.g. Module 1: Reconnaissance" />
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea className="form-control" rows="3" value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} placeholder="Brief summary of module objectives..."></textarea>
              </div>
              <div className="form-group" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="modPub" checked={moduleForm.published} onChange={(e) => setModuleForm({ ...moduleForm, published: e.target.checked })} />
                <label htmlFor="modPub" style={{ color: 'var(--white)' }}>Published (Visible to students)</label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModuleModal(false)} className="btn btn-outline-cyan">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-cyan">{submitting ? 'Saving...' : 'Save Module'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT LECTURE MODAL */}
      {showLectureModal && (
        <div className="modal-overlay" style={{ display: 'flex', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '30px', maxWidth: '650px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--white)', marginBottom: '20px' }}>{editingLecture ? 'Edit Lecture' : 'Create New Lecture'}</h3>
            <form onSubmit={handleSaveLecture}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Lecture Title *</label>
                <input type="text" className="form-control" required value={lectureForm.title} onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })} placeholder="e.g. 1.1 Introduction to Nmap" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group">
                  <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Content Type</label>
                  <select className="form-control" value={lectureForm.type} onChange={(e) => setLectureForm({ ...lectureForm, type: e.target.value })}>
                    <option value="video">🎬 Recorded Video</option>
                    <option value="lab_video">🧪 Lab Setup Video</option>
                    <option value="text">📖 Reading / Text</option>
                    <option value="pdf">📄 PDF Document</option>
                    <option value="resource">📥 External Resource</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Duration (Seconds)</label>
                  <input type="number" className="form-control" value={lectureForm.durationSeconds} onChange={(e) => setLectureForm({ ...lectureForm, durationSeconds: parseInt(e.target.value) || 0 })} />
                </div>
              </div>

              {(lectureForm.type === 'video' || lectureForm.type === 'lab_video') && (
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Video URL (MP4 / HLS / Embed) *</label>
                  <input type="url" className="form-control" value={lectureForm.video} onChange={(e) => setLectureForm({ ...lectureForm, video: e.target.value })} placeholder="https://..." />
                </div>
              )}

              {lectureForm.type === 'text' && (
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Text Content (Markdown / Text)</label>
                  <textarea className="form-control" rows="5" value={lectureForm.content} onChange={(e) => setLectureForm({ ...lectureForm, content: e.target.value })} placeholder="Lesson reading text..."></textarea>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Short Description</label>
                <textarea className="form-control" rows="2" value={lectureForm.description} onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })} placeholder="Key objectives of this lesson..."></textarea>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="lecPrev" checked={lectureForm.preview} onChange={(e) => setLectureForm({ ...lectureForm, preview: e.target.checked })} />
                  <label htmlFor="lecPrev" style={{ color: 'var(--cyan-primary)', fontWeight: 'bold' }}>Free Preview (Publicly Viewable)</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="lecPub" checked={lectureForm.published} onChange={(e) => setLectureForm({ ...lectureForm, published: e.target.checked })} />
                  <label htmlFor="lecPub" style={{ color: 'var(--white)' }}>Published</label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowLectureModal(false)} className="btn btn-outline-cyan">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-cyan">{submitting ? 'Saving...' : 'Save Lecture'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
