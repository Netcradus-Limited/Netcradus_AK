import React from 'react';
import { useApp } from '../App';
import { CONTACT_INFO } from '../data/programmesData';

export default function FloatingBar() {
  const { openModal, openDrawer } = useApp() || {};

  const handleEnquire = () => {
    if (openDrawer) {
      openDrawer('enquire');
    } else if (openModal) {
      openModal('enroll');
    }
  };

  const handleCall = () => {
    if (openModal) {
      openModal('call');
    }
  };

  const whatsappUrl = CONTACT_INFO.getWhatsAppUrl();

  return (
    <aside className="floating-contact-bar" aria-label="Quick contact tools">
      <button
        type="button"
        className="floating-btn enquire-btn"
        onClick={handleEnquire}
        title="Enquire for Admissions"
      >
        <i className="fa-solid fa-pen-to-square"></i>
        <span>Enquire Now</span>
      </button>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-btn whatsapp-btn"
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp with Admissions Advisor"
      >
        <i className="fa-brands fa-whatsapp"></i>
        <span>WhatsApp</span>
      </a>

      <button
        type="button"
        className="floating-btn call-btn"
        onClick={handleCall}
        title="Call Admissions Desk"
      >
        <i className="fa-solid fa-phone-volume"></i>
        <span>Call Us</span>
      </button>
    </aside>
  );
}
