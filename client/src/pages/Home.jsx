import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';
import PopularProgramsSection from '../components/PopularProgramsSection';
import ExplorePortalSection from '../components/ExplorePortalSection';

export default function Home() {
  const { openModal, openEnrollModalFor, openCourseDetails } = useApp();

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <section className="hero-section hero-redesign" id="home">
        {/* Full Single Background Image */}
        <div className="hero-bg-photo-container">
          <img 
            src="/images/home-hero-bg.png" 
            alt="Netcradus Academia Campus & Students" 
            className="hero-bg-photo" 
          />
        </div>

        <div className="container hero-container">
          {/* Empty Left Space reserved for Campus & Students background visual */}
          <div className="hero-left-spacer"></div>

          {/* Hero Right Content (Positioned in intentional empty right area) */}
          <div className="hero-content hero-right-content">
            <div className="badge-pill pill-orange">
              <i className="fa-solid fa-graduation-cap"></i>
              <span>EMPOWERING FUTURES</span>
            </div>

            <h1 className="hero-title hero-title-large">
              <span className="hero-title-nowrap">Learn. Build.</span><br />
              <span className="highlight-orange-gradient">Succeed.</span>
            </h1>

            <p className="hero-subtitle hero-subtitle-new">
              Netcradus Academia is your pathway to in-demand skills, real-world projects, and industry-recognized certifications that accelerate your career.
            </p>

            <div className="hero-buttons">
              <Link to="/dashboard" className="btn btn-orange-glow">
                EXPLORE DASHBOARD <i className="fa-solid fa-arrow-right-long"></i>
              </Link>
              <Link to="/about" className="btn btn-outline-orange">
                ABOUT US <i className="fa-solid fa-caret-right"></i>
              </Link>
            </div>
          </div>
        </div>

        {/* OVERLAPPING WIDE BOTTOM STATS BAR */}
        <div className="hero-stats-container">
          <div className="new-stats-bar">
            <div className="ns-item">
              <div className="ns-icon"><i className="fa-solid fa-users"></i></div>
              <div className="ns-info">
                <h3>50,000+</h3>
                <p>Active Learners</p>
              </div>
            </div>

            <div className="ns-divider"></div>

            <div className="ns-item">
              <div className="ns-icon"><i className="fa-solid fa-circle-play"></i></div>
              <div className="ns-info">
                <h3>100+</h3>
                <p>Expert Courses</p>
              </div>
            </div>

            <div className="ns-divider"></div>

            <div className="ns-item">
              <div className="ns-icon"><i className="fa-solid fa-certificate"></i></div>
              <div className="ns-info">
                <h3>25+</h3>
                <p>Industry Certificates</p>
              </div>
            </div>

            <div className="ns-divider"></div>

            <div className="ns-item">
              <div className="ns-icon"><i className="fa-solid fa-rocket"></i></div>
              <div className="ns-info">
                <h3>500+</h3>
                <p>Real-World Projects</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REDESIGNED POPULAR PROGRAMS SECTION */}
      <PopularProgramsSection />

      {/* REDESIGNED EXPLORE PORTAL SECTION */}
      <ExplorePortalSection />
    </div>
  );
}

