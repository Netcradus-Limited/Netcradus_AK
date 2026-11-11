import React, { useState } from 'react';

export default function FAQAccordion({ items, allowMultiple = false }) {
  const [openIndices, setOpenIndices] = useState([0]);

  if (!items || items.length === 0) return null;

  const toggleIndex = (idx) => {
    if (allowMultiple) {
      setOpenIndices((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
      );
    } else {
      setOpenIndices((prev) => (prev.includes(idx) ? [] : [idx]));
    }
  };

  return (
    <div className="faq-accordion-component">
      {items.map((item, idx) => {
        const isOpen = openIndices.includes(idx);
        return (
          <div
            key={idx}
            className={`faq-item-card ${isOpen ? 'active' : ''}`}
          >
            <button
              type="button"
              className="faq-question-btn"
              onClick={() => toggleIndex(idx)}
              aria-expanded={isOpen}
            >
              <span className="faq-q-text">{item.q}</span>
              <span className="faq-icon-indicator">
                <i className={`fa-solid ${isOpen ? 'fa-minus' : 'fa-plus'}`}></i>
              </span>
            </button>
            <div className={`faq-answer-collapse ${isOpen ? 'open' : ''}`}>
              <div className="faq-answer-inner">
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

