import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';

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

      {/* FEATURED COURSES SECTION */}
      <section className="section courses-preview-section" id="featured-courses">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge"><i className="fa-solid fa-graduation-cap"></i> POPULAR PROGRAMS</span>
            <h2 className="section-title">Explore Industry-Ready Courses</h2>
            <p className="section-desc">
              Master high-demand tech skills with hands-on virtual labs, real-world projects, and global certifications.
            </p>
          </div>

          <div className="courses-grid">
            {/* Cyber Course Preview */}
            <div className="course-card">
              <div className="course-banner cyber-bg">
                <img src="/images/cyber.png" alt="Ethical Hacking & VAPT" className="course-banner-img" />
                <div className="banner-overlay"></div>
                <div className="course-badge">CYBER SECURITY</div>
                <div className="banner-icon"><i className="fa-solid fa-user-secret"></i></div>
                <h3 className="banner-title">Ethical Hacking & VAPT</h3>
              </div>
              <div className="course-content">
                <h4 className="course-subtitle">Ethical Hacking & VAPT Professional Program</h4>
                <p className="course-meta">
                  <i className="fa-regular fa-clock"></i> 6 Months | <i className="fa-solid fa-laptop-code"></i> Live Labs & SOC
                </p>
                <ul className="course-highlights">
                  <li><i className="fa-solid fa-check"></i> Vulnerability Assessment & Penetration Testing</li>
                  <li><i className="fa-solid fa-check"></i> Network & Web Application Security</li>
                </ul>
                <div className="course-footer">
                  <button className="btn-link" onClick={() => openCourseDetails('cyber')}>
                    VIEW COURSE <i className="fa-solid fa-arrow-right-long"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-cyan" onClick={() => openEnrollModalFor('Ethical Hacking & VAPT')}>
                    Enroll
                  </button>
                </div>
              </div>
            </div>

            {/* AI Course Preview */}
            <div className="course-card">
              <div className="course-banner ai-bg">
                <img src="/images/ai.png" alt="AI & Machine Learning" className="course-banner-img" />
                <div className="banner-overlay"></div>
                <div className="course-badge">ARTIFICIAL INTELLIGENCE</div>
                <div className="banner-icon"><i className="fa-solid fa-brain"></i></div>
                <h3 className="banner-title">AI & Machine Learning</h3>
              </div>
              <div className="course-content">
                <h4 className="course-subtitle">AI & Machine Learning With Generative AI</h4>
                <p className="course-meta">
                  <i className="fa-regular fa-clock"></i> 6 Months | <i className="fa-solid fa-microchip"></i> PyTorch & LLMs
                </p>
                <ul className="course-highlights">
                  <li><i className="fa-solid fa-check"></i> Deep Learning & Neural Networks</li>
                  <li><i className="fa-solid fa-check"></i> Generative AI, RAG & LangChain</li>
                </ul>
                <div className="course-footer">
                  <button className="btn-link" onClick={() => openCourseDetails('ai')}>
                    VIEW COURSE <i className="fa-solid fa-arrow-right-long"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-cyan" onClick={() => openEnrollModalFor('AI & Machine Learning With Generative AI')}>
                    Enroll
                  </button>
                </div>
              </div>
            </div>

            {/* Cloud Course Preview */}
            <div className="course-card">
              <div className="course-banner cloud-bg">
                <img src="/images/cloud.png" alt="Cloud Architecture" className="course-banner-img" />
                <div className="banner-overlay"></div>
                <div className="course-badge">CLOUD COMPUTING</div>
                <div className="banner-icon"><i className="fa-solid fa-cloud-arrow-up"></i></div>
                <h3 className="banner-title">Cloud Architecture</h3>
              </div>
              <div className="course-content">
                <h4 className="course-subtitle">AWS, Azure & Google Cloud Masterclass</h4>
                <p className="course-meta">
                  <i className="fa-regular fa-clock"></i> 5 Months | <i className="fa-solid fa-network-wired"></i> Multi-Cloud Labs
                </p>
                <ul className="course-highlights">
                  <li><i className="fa-solid fa-check"></i> AWS Solutions Architect Prep</li>
                  <li><i className="fa-solid fa-check"></i> Terraform Infrastructure as Code</li>
                </ul>
                <div className="course-footer">
                  <button className="btn-link" onClick={() => openCourseDetails('cloud')}>
                    VIEW COURSE <i className="fa-solid fa-arrow-right-long"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-cyan" onClick={() => openEnrollModalFor('AWS, Azure & Google Cloud Architecture')}>
                    Enroll
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center" style={{ marginTop: '40px' }}>
            <Link to="/courses" className="btn btn-cyan btn-lg">
              VIEW ALL COURSES <i className="fa-solid fa-arrow-right-long"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* PORTAL PAGE LAUNCHER GRID */}
      <section className="section portal-hub-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge">EXPLORE NETCRADUS PORTAL</span>
            <h2 className="section-title">Open Any Section Individually</h2>
            <p className="section-desc">Select any dedicated page module below to jump directly into the full experience.</p>
          </div>

          <div className="hub-pages-grid">
            <Link to="/about" className="hub-card">
              <div className="hub-icon"><i className="fa-solid fa-building-columns"></i></div>
              <h3>About Us</h3>
              <p>Learn about our virtual cloud labs, certified mentors, and learning ecosystem.</p>
              <span className="hub-link">Open About Page <i className="fa-solid fa-arrow-right"></i></span>
            </Link>

            <Link to="/courses" className="hub-card">
              <div className="hub-icon"><i className="fa-solid fa-layer-group"></i></div>
              <h3>Popular Courses</h3>
              <p>Explore 100+ industry tracks: Ethical Hacking, AI & ML, Cloud, Data Science, MERN & SOC.</p>
              <span className="hub-link">Open Courses Page <i className="fa-solid fa-arrow-right"></i></span>
            </Link>

            <Link to="/projects" className="hub-card">
              <div className="hub-icon"><i className="fa-solid fa-diagram-project"></i></div>
              <h3>Real-World Projects</h3>
              <p>3 to 6 months hands-on projects, live code submissions, stipend tracks, and mentor guidance.</p>
              <span className="hub-link">Open Projects Page <i className="fa-solid fa-arrow-right"></i></span>
            </Link>

            <Link to="/dashboard" className="hub-card highlight-hub">
              <div className="hub-icon"><i className="fa-solid fa-gauge-high"></i></div>
              <h3>Student Dashboard</h3>
              <p>Access your live classes, recorded lectures, assignments, progress graph, and virtual sandboxes.</p>
              <span className="hub-link">Launch Student Dashboard <i className="fa-solid fa-arrow-right"></i></span>
            </Link>

            <Link to="/certificate" className="hub-card">
              <div className="hub-icon"><i className="fa-solid fa-award"></i></div>
              <h3>Certificate Verification</h3>
              <p>Verify 12-digit student credentials, download ISO-certified certificates, and share to LinkedIn.</p>
              <span className="hub-link">Open Certificate Portal <i className="fa-solid fa-arrow-right"></i></span>
            </Link>

            <Link to="/contact" className="hub-card">
              <div className="hub-icon"><i className="fa-solid fa-headset"></i></div>
              <h3>Contact Us</h3>
              <p>Connect with expert academic counselors, request a demo callback, or visit our tech campus.</p>
              <span className="hub-link">Open Contact Page <i className="fa-solid fa-arrow-right"></i></span>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES / VALUE PROPOSITION BAR */}
      <section className="features-bar-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon"><i className="fa-solid fa-display"></i></div>
              <div className="feature-text">
                <h4>LIVE CLASSES</h4>
                <p>Interactive instructor-led sessions</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><i className="fa-solid fa-gears"></i></div>
              <div className="feature-text">
                <h4>HANDS-ON LABS</h4>
                <p>Real-world labs and tools for practical learning</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><i className="fa-solid fa-certificate"></i></div>
              <div className="feature-text">
                <h4>CERTIFICATIONS</h4>
                <p>Industry-recognized certifications</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><i className="fa-solid fa-diagram-project"></i></div>
              <div className="feature-text">
                <h4>REAL-WORLD PROJECTS</h4>
                <p>Work on live projects with expert guidance</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
