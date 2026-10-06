import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import InstructorSidebar from './InstructorSidebar';
import InstructorHeader from './InstructorHeader';

export default function InstructorLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path) => {
    if (path.includes('/instructor/courses/new')) return 'Create New Course';
    if (path.includes('/curriculum')) return 'Curriculum Builder';
    if (path.includes('/assignments')) return 'Assignment Manager';
    if (path.includes('/instructor/courses/')) return 'Course Overview';
    if (path.includes('/instructor/courses')) return 'My Assigned Courses';
    if (path.includes('/instructor/submissions')) return 'Submissions & Grading';
    if (path.includes('/instructor/students')) return 'Enrolled Students Roster';
    if (path.includes('/instructor/profile')) return 'Instructor Profile';
    return 'Instructor Dashboard';
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="admin-app-container">
      <InstructorSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="admin-main-wrapper">
        <InstructorHeader
          title={title}
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
        />

        <main className="admin-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
