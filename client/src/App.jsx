import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthLayoutContainer from './components/auth/AuthLayoutContainer';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import About from './pages/About';
import Programmes from './pages/Programmes';
import ProgrammeDetail from './pages/ProgrammeDetail';
import LearningJourney from './pages/LearningJourney';
import Careers from './pages/Careers';
import Institutions from './pages/Institutions';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Certificate from './pages/Certificate';
import Projects from './pages/Projects';
import Dashboard from './pages/Dashboard';
import MyCourses from './pages/MyCourses';
import Learn from './pages/Learn';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminInstructors from './pages/admin/AdminInstructors';
import AdminCourses from './pages/admin/AdminCourses';
import AdminCurriculum from './pages/admin/AdminCurriculum';
import AdminAssignments from './pages/admin/AdminAssignments';
import AdminEnrollments from './pages/admin/AdminEnrollments';
import AdminPayments from './pages/admin/AdminPayments';
import AdminCertificates from './pages/admin/AdminCertificates';
import AdminCategories from './pages/admin/AdminCategories';
import AdminInquiries from './pages/admin/AdminInquiries';
import InstructorLayout from './components/instructor/InstructorLayout';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorCourses from './pages/instructor/InstructorCourses';
import InstructorCourseForm from './pages/instructor/InstructorCourseForm';
import InstructorCourseManage from './pages/instructor/InstructorCourseManage';
import InstructorCurriculum from './pages/instructor/InstructorCurriculum';
import InstructorAssignments from './pages/instructor/InstructorAssignments';
import InstructorSubmissions from './pages/instructor/InstructorSubmissions';
import InstructorStudents from './pages/instructor/InstructorStudents';
import InstructorProfile from './pages/instructor/InstructorProfile';
import { academyService } from './services/academyService';
import { PROGRAMMES } from './data/programmesData';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export default function App() {
  const [activeModal, setActiveModal] = useState(null);
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [enrollCourseName, setEnrollCourseName] = useState(PROGRAMMES[0].title);
  const [selectedCourseKey, setSelectedCourseKey] = useState(PROGRAMMES[0].slug);
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
      console.warn('[App] Falling back to official brochure catalog:', err.message);
      // Graceful fallback to brochure data so the UI is always loaded
      setCourses(PROGRAMMES);
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
    setEnrollCourseName(courseTitle || PROGRAMMES[0].title);
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
    showToast(`Thank you! Your ${formTitle} has been received. Our team will contact you shortly.`);
    if (event.target) {
      event.target.reset();
    }
  };

  return (
    <AuthProvider>
      <AppContext.Provider
        value={{
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
        }}
      >
        <BrowserRouter>
          <Routes>
            {/* Main Website Routes */}
            <Route path="/" element={<Layout />}>
              {/* Public Official Brochure Routes */}
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="programmes" element={<Programmes />} />
              <Route path="programmes/:slug" element={<ProgrammeDetail />} />
              <Route path="courses" element={<Programmes />} />
              <Route path="courses/:slug" element={<ProgrammeDetail />} />
              <Route path="learning-journey" element={<LearningJourney />} />
              <Route path="careers" element={<Careers />} />
              <Route path="career-opportunities" element={<Careers />} />
              <Route path="institutions" element={<Institutions />} />
              <Route path="contact" element={<Contact />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:slug" element={<BlogPost />} />
              <Route path="certificate" element={<Certificate />} />
              <Route path="projects" element={<Projects />} />

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
                <Route path="instructors" element={<AdminInstructors />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="courses/:courseId/curriculum" element={<AdminCurriculum />} />
                <Route path="courses/:courseId/assignments" element={<AdminAssignments />} />
                <Route path="enrollments" element={<AdminEnrollments />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="certificates" element={<AdminCertificates />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="inquiries" element={<AdminInquiries />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Route>
            </Route>

            {/* Protected Instructor Routes (Authenticated Instructors ONLY) */}
            <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
              <Route path="/instructor" element={<InstructorLayout />}>
                <Route index element={<Navigate to="/instructor/dashboard" replace />} />
                <Route path="dashboard" element={<InstructorDashboard />} />
                <Route path="courses" element={<InstructorCourses />} />
                <Route path="courses/new" element={<InstructorCourseForm />} />
                <Route path="courses/:courseId" element={<InstructorCourseManage />} />
                <Route path="courses/:courseId/edit" element={<InstructorCourseForm />} />
                <Route path="courses/:courseId/curriculum" element={<InstructorCurriculum />} />
                <Route path="courses/:courseId/assignments" element={<InstructorAssignments />} />
                <Route path="assignments/:assignmentId/submissions" element={<InstructorSubmissions />} />
                <Route path="submissions" element={<InstructorSubmissions />} />
                <Route path="students" element={<InstructorStudents />} />
                <Route path="profile" element={<InstructorProfile />} />
                <Route path="*" element={<Navigate to="/instructor/dashboard" replace />} />
              </Route>
            </Route>

            {/* Public Authentication Routes */}
            <Route element={<PublicOnlyRoute />}>
              <Route element={<AuthLayoutContainer />}>
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password/:token" element={<ResetPassword />} />
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
