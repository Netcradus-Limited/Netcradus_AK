import React from 'react';
import { useApp } from '../App';

export default function Projects() {
  const { openEnrollModalFor, showToast } = useApp();

  const projectsList = [
    {
      title: "Netcradus Autonomous SOC Threat Intelligence Engine",
      image: "/images/socthreats.png",
      badge: "CYBER SECURITY & SOC",
      badgeIcon: "fa-solid fa-shield-halved",
      duration: "60 Practical Hrs",
      desc: "Build an automated Security Operations Center pipeline that ingests live network PCAP files, parses Syslog events into Splunk SIEM, runs YARA malware rules, and triggers automated Telegram/Slack alert playbooks upon detecting ransomware patterns.",
      tags: ["Python", "Splunk SIEM", "Wireshark", "Elasticsearch", "YARA Rules"],
      enrollTitle: "SOC Threat Intelligence Engine Project",
      specMessage: "Loading Project Architecture Blueprint PDF..."
    },
    {
      title: "Netcradus GenAI Enterprise Assistant with RAG",
      image: "/images/gen.png",
      badge: "AI & GENERATIVE AI",
      badgeIcon: "fa-solid fa-brain",
      badgeColor: "#6fb1fc",
      badgeBg: "rgba(111, 177, 252, 0.12)",
      badgeBorder: "rgba(111, 177, 252, 0.3)",
      duration: "70 Practical Hrs",
      desc: "Engineer an enterprise Retrieval-Augmented Generation (RAG) agent using LangChain, ChromaDB vector store, and PyTorch. Connect internal PDF knowledge bases with LLaMA 3 8B models to deliver zero-hallucination document analysis.",
      tags: ["PyTorch", "LangChain", "ChromaDB", "FastAPI", "LLaMA 3"],
      enrollTitle: "GenAI RAG Assistant Project",
      specMessage: "Loading AI Model Architecture Spec..."
    },
    {
      title: "Multi-Cloud Automated Infrastructure with Terraform & Kubernetes",
      image: "/images/devops.png",
      badge: "CLOUD & DEVOPS",
      badgeIcon: "fa-solid fa-cloud",
      duration: "55 Practical Hrs",
      desc: "Architect a high-availability infrastructure across AWS and Azure using Terraform scripts. Provision EKS Kubernetes clusters, configure Docker container auto-scaling, set up Ansible playbooks, and automate GitOps CI/CD pipelines.",
      tags: ["Terraform", "AWS EKS", "Kubernetes", "Docker", "Ansible"],
      enrollTitle: "Multi-Cloud Kubernetes Project",
      specMessage: "Loading Terraform Topology Diagram..."
    },
    {
      title: "Netcradus Automated Web VAPT & Privilege Escalation Audit Suite",
      image: "/images/vapt.png",
      badge: "VAPT & PENETRATION TESTING",
      badgeIcon: "fa-solid fa-user-ninja",
      duration: "50 Practical Hrs",
      desc: "Develop a custom vulnerability assessment suite that conducts automated SQL injection, Cross-Site Scripting (XSS), and CORS misconfiguration tests against isolated target VM environments, outputting executive report summaries.",
      tags: ["Burp Suite Pro", "Metasploit", "OWASP ZAP", "Python Exploit Scripting"],
      enrollTitle: "VAPT Audit Suite Project",
      specMessage: "Loading Penetration Testing Spec..."
    },
    {
      title: "Netcradus Microservices E-Learning & Cloud Sandbox SaaS Platform",
      image: "/images/mern.png",
      badge: "FULL STACK MERN & NEXT.JS",
      badgeIcon: "fa-solid fa-code",
      badgeColor: "#6fb1fc",
      badgeBg: "rgba(111, 177, 252, 0.12)",
      badgeBorder: "rgba(111, 177, 252, 0.3)",
      duration: "65 Practical Hrs",
      desc: "Build a production-ready edtech SaaS application with Next.js 14, Node.js microservices backend, MongoDB database, Docker containerized code runner sandbox, Stripe payment processing, and JWT authentication.",
      tags: ["Next.js 14", "React 18", "Node.js", "MongoDB", "Docker"],
      enrollTitle: "Full Stack SaaS Platform Project",
      specMessage: "Loading Full Stack System Design PDF..."
    },
    {
      title: "High-Frequency Financial Market Sentiment & Analytics Platform",
      image: "/images/science.png",
      badge: "DATA SCIENCE & ANALYTICS",
      badgeIcon: "fa-solid fa-chart-line",
      duration: "40 Practical Hrs",
      desc: "Ingest live financial news streams using Kafka and Python. Run NLP sentiment classification models, calculate moving risk metrics, and publish automated interactive PowerBI dashboards for traders.",
      tags: ["Python", "Advanced SQL", "PowerBI", "Apache Kafka"],
      enrollTitle: "Financial Analytics Project",
      specMessage: "Loading Data Analytics Schema PDF..."
    }
  ];

  return (
    <div className="projects-page">
      {/* PAGE HEADER */}
      <section className="page-banner-section">
        <div className="container text-center">
          <span className="section-badge"><i className="fa-solid fa-code"></i> REAL-WORLD INDUSTRY BUILDS</span>
          <h1 className="page-title">Netcradus Live Industry Projects</h1>
          <p className="page-subtitle">
            Build, deploy, and defend enterprise-grade cybersecurity, AI, cloud architecture, and full stack software engineered for modern tech companies.
          </p>
        </div>
      </section>

      {/* PROJECTS CONTENT SECTION */}
      <section className="section projects-section" id="projects">
        <div className="container">
          
          <div className="section-header text-center" style={{ marginBottom: '40px' }}>
            <span className="section-badge">FEATURED LIVE BUILDS</span>
            <h2 className="section-title">Explore Netcradus Hands-on Projects</h2>
            <p className="section-desc">
              Every project features real enterprise problem statements, GitHub repository codebases, cloud sandbox deployments, and direct code reviews by Netcradus Senior Engineers.
            </p>
          </div>

          {/* Project Cards Grid */}
          <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
            {projectsList.map((p, idx) => (
              <div key={idx} className="project-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'var(--transition)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
                <div>
                  <div style={{ position: 'relative', height: '150px', margin: '-25px -25px 18px -25px', overflow: 'hidden' }}>
                    <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6, 12, 25, 0.2) 0%, rgba(16, 30, 56, 0.95) 100%)' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <span style={{
                      background: p.badgeBg || 'rgba(245, 158, 11, 0.12)',
                      color: p.badgeColor || 'var(--cyan-primary)',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: p.badgeBorder ? `1px solid ${p.badgeBorder}` : '1px solid var(--border-glow)'
                    }}>
                      <i className={p.badgeIcon}></i> {p.badge}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}><i className="fa-regular fa-clock"></i> {p.duration}</span>
                  </div>
                  <h3 style={{ fontSize: '1.35rem', color: 'var(--white)', marginBottom: '10px' }}>{p.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '18px' }}>{p.desc}</p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                    {p.tags.map((tag, tIdx) => (
                      <span key={tIdx} style={{ background: 'var(--bg-dark)', color: '#cbd5e1', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', border: '1px solid var(--border-subtle)' }}>{tag}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '15px' }}>
                  <button className="btn btn-sm btn-cyan btn-block" onClick={() => openEnrollModalFor(p.enrollTitle)}>
                    <i className="fa-solid fa-rocket"></i> Start This Project
                  </button>
                  <button className="btn btn-sm btn-outline" onClick={() => showToast(p.specMessage)}>
                    <i className="fa-solid fa-sitemap"></i> View Spec
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
