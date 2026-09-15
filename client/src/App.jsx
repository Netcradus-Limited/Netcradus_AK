import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthLayoutContainer from './components/auth/AuthLayoutContainer';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import Dashboard from './pages/Dashboard';
import Certificate from './pages/Certificate';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminCourses from './pages/admin/AdminCourses';
import AdminEnrollments from './pages/admin/AdminEnrollments';
import AdminInquiries from './pages/admin/AdminInquiries';
import CourseDetail from './pages/CourseDetail';
import MyCourses from './pages/MyCourses';
import Learn from './pages/Learn';
import AdminCurriculum from './pages/admin/AdminCurriculum';
import { academyService } from './services/academyService';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export default function App() {
  const [activeModal, setActiveModal] = useState(null);
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [enrollCourseName, setEnrollCourseName] = useState('');
  const [selectedCourseKey, setSelectedCourseKey] = useState('cyber');
  const [toast, setToast] = useState({ show: false, message: '' });

  // Dynamic API Courses state
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  const loadCourses = async () => {
    setLoadingCourses(true);
    setCoursesError(null);
    try {
      const data = await academyService.getCourses('all');
      setCourses(data);
    } catch (err) {
      console.error('[App] Failed to fetch courses catalog from API:', err);
      setCoursesError(err.message || 'Unable to load courses right now. Please try again.');
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  const closeModal = (modalType, forceEnroll = false) => {
    setActiveModal(null);
    if (forceEnroll) {
      setTimeout(() => {
        setActiveModal('enroll');
      }, 150);
    }
  };

  const openDrawer = (drawerType) => {
    setActiveDrawer(drawerType);
  };

  const closeDrawer = () => {
    setActiveDrawer(null);
  };

  const openEnrollModalFor = (courseTitle) => {
    setEnrollCourseName(courseTitle || '');
    setActiveModal('enroll');
  };

  const openCourseDetails = (courseKey) => {
    setSelectedCourseKey(courseKey);
    setActiveModal('courseDetail');
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 4500);
  };

  const handleFormSubmit = (event, formTitle) => {
    event.preventDefault();
    setActiveModal(null);
    setActiveDrawer(null);
    showToast(`Thank you! Your ${formTitle} has been received. Our team will contact you within 2 hours.`);
    if (event.target) {
      event.target.reset();
    }
  };

  return (
    <AuthProvider>
      <AppContext.Provider value={{
        activeModal,
        activeDrawer,
        openModal,
        closeModal,
        openDrawer,
        closeDrawer,
        enrollCourseName,
        setEnrollCourseName,
        openEnrollModalFor,
        selectedCourseKey,
        setSelectedCourseKey,
        openCourseDetails,
        toast,
        showToast,
        handleFormSubmit,
        courses,
        loadingCourses,
        coursesError,
        reloadCourses: loadCourses,
      }}>
        <BrowserRouter>
          <Routes>
            {/* Main Website Routes */}
            <Route path="/" element={<Layout />}>
              {/* Public Routes (Accessible without authentication) */}
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:slug" element={<CourseDetail />} />
              <Route path="projects" element={<Projects />} />
              <Route path="contact" element={<Contact />} />
              <Route path="certificate" element={<Certificate />} />

              {/* Protected Student Routes (Authenticated Students ONLY) */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="my-courses" element={<MyCourses />} />
                <Route path="learn/:courseId" element={<Learn />} />
              </Route>
            </Route>

            {/* Protected Admin Routes (Admin & Super Admin ONLY) */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="courses/:courseId/curriculum" element={<AdminCurriculum />} />
                <Route path="enrollments" element={<AdminEnrollments />} />
                <Route path="inquiries" element={<AdminInquiries />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Route>
            </Route>

            {/* Public Authentication Routes */}
            <Route element={<PublicOnlyRoute />}>
              <Route element={<AuthLayoutContainer />}>
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
              </Route>
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppContext.Provider>
    </AuthProvider>
  );
}

