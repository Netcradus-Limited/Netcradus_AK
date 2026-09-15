import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path) => {
    if (path.includes('/admin/students')) return 'Student Management';
    if (path.includes('/admin/courses')) return 'Course Management';
    if (path.includes('/admin/enrollments')) return 'Enrollment Applications';
    if (path.includes('/admin/inquiries')) return 'Leads & Inquiries';
    return 'Admin Dashboard';
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="admin-app-container">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="admin-main-wrapper">
        <AdminHeader
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
