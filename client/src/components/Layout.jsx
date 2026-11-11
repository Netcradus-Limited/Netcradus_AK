import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingBar from './FloatingBar';
import Modals from './Modals';
import { useApp } from '../App';

export default function Layout() {
  const { toast } = useApp() || {};

  return (
    <>
      {/* Main Navigation Header */}
      <Navbar />

      {/* Floating Quick Action Contacts sidebar */}
      <FloatingBar />

      {/* Page Content Output */}
      <Outlet />

      {/* Footer */}
      <Footer />

      {/* Overlay Modals & Drawers */}
      <Modals />

      {/* Global Toast Alerts */}
      {toast && (
        <div className={`toast ${toast.show ? 'show' : ''}`} id="toast">
          <div className="toast-icon">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div className="toast-message" id="toastMessage">
            {toast.message}
          </div>
        </div>
      )}
    </>
  );
}
