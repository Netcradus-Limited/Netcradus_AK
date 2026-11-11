/**
 * NETCRADUS ACADEMY - EMERGING TECHNOLOGIES PROGRAMME
 * OFFICIAL PROGRAMME DATA & CATALOG
 * Primary Source of Truth: Netcradus Emerging Technologies Programme Brochure
 */

export const CONTACT_INFO = {
  academyName: "Netcradus Academy",
  programmeName: "Netcradus Emerging Technologies Programme",
  email: "academy@netcradus.com",
  phone: "+91 7290909574",
  phoneClean: "917290909574",
  website: "academy.netcradus.com",
  address: "G-260, Sector 63, Noida, UP, India",
  whatsappBaseUrl: "https://wa.me/917290909574",
  getWhatsAppUrl: (programmeTitle) => {
    const text = programmeTitle
      ? `Hello Netcradus Academy, I would like to enquire about the ${programmeTitle} programme.`
      : "Hello Netcradus Academy, I would like to enquire about the Emerging Technologies Programme.";
    return `https://wa.me/917290909574?text=${encodeURIComponent(text)}`;
  }
};

export const TRACKS = [
  {
    id: "offensive-security",
    title: "Offensive Security",
    shortTitle: "Offensive",
    count: 2,
    badge: "2 Programmes",
    icon: "fa-solid fa-shield-virus",
    accentColor: "#ef4444",
    bgGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)",
    borderGlow: "rgba(239, 68, 68, 0.3)",
    description: "Learn to identify system vulnerabilities and conduct authorized penetration tests using professional attack methodologies and reporting frameworks.",
    programmes: ["vapt-analyst", "penetration-tester"]
  },
  {
    id: "defence-governance",
    title: "Defence & Governance",
    shortTitle: "Defence",
    count: 3,
    badge: "3 Programmes",
    icon: "fa-solid fa-shield-halved",
    accentColor: "#3b82f6",
    bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)",
    borderGlow: "rgba(59, 130, 246, 0.3)",
    description: "Detect live security threats, safeguard multi-cloud infrastructure, and govern enterprise risk and regulatory compliance.",
    programmes: ["soc-analyst", "cloud-security-analyst", "grc-analyst"]
  },
  {
    id: "secure-engineering",
    title: "Secure Engineering",
    shortTitle: "Engineering",
    count: 2,
    badge: "2 Programmes",
    icon: "fa-solid fa-code-merge",
    accentColor: "#10b981",
    bgGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)",
    borderGlow: "rgba(16, 185, 129, 0.3)",
    description: "Build security directly into modern software pipelines and defend emerging AI/LLM models against sophisticated adversarial attacks.",
    programmes: ["ai-security-engineer", "devsecops"]
  },
  {
    id: "ai-automation",
    title: "AI & Automation",
    shortTitle: "AI & Auto",
    count: 4,
    badge: "4 Programmes",
    icon: "fa-solid fa-brain",
    accentColor: "#f59e0b",
    bgGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)",
    borderGlow: "rgba(245, 158, 11, 0.3)",
    description: "Develop AI models, design autonomous agent workflows, build low-code automations, and master systematic prompt engineering.",
    programmes: ["ai-developer", "ai-automation", "agentic-ai", "prompt-engineer"]
  }
];

export const PROGRAMMES = [
  // --------------------------------------------------------------------------
  // PROGRAMME 01: VAPT ANALYST
  // --------------------------------------------------------------------------
  {
    number: "01",
    code: "PROG-01",
    title: "VAPT Analyst",
    slug: "vapt-analyst",
    track: "Offensive Security",
    trackId: "offensive-security",
    tagline: "Find the weaknesses before attackers do.",
    overview: "Learn to discover, validate and report security weaknesses in web applications, networks and infrastructure.",
    idealFor: "Beginners with basic IT knowledge, students and IT staff moving into security.",
    targetAudience: [
      "Beginners with foundational IT or networking awareness",
      "College students aiming for early cybersecurity careers",
      "System administrators and IT support staff moving into security"
    ],
    learningOutcomes: [
      "Run a structured vulnerability assessment from scoping to retest.",
      "Identify and exploit common OWASP Top 10 flaws in a safe lab.",
      "Write clear findings with severity ratings and remediation advice."
    ],
    modules: [
      {
        number: 1,
        title: "Cyber Security and Networking Fundamentals",
        topics: ["TCP/IP protocol suite", "OSI model layers", "Common network ports and services", "Security principles and threat terminology"]
      },
      {
        number: 2,
        title: "Reconnaissance and Enumeration",
        topics: ["Passive vs. active information gathering", "DNS and WHOIS enumeration", "Port scanning with Nmap", "Service and OS fingerprinting"]
      },
      {
        number: 3,
        title: "Vulnerability Scanning and Triage",
        topics: ["Automated scanners (Nessus, OpenVAS)", "False-positive analysis", "CVSS scoring and risk triage", "Vulnerability prioritization"]
      },
      {
        number: 4,
        title: "Web Application Testing (OWASP Top 10)",
        topics: ["SQL Injection (SQLi) detection", "Cross-Site Scripting (XSS)", "Broken Authentication and IDOR", "Burp Suite proxy operations"]
      },
      {
        number: 5,
        title: "Network and Infrastructure Assessment",
        topics: ["Wi-Fi security testing", "Firewall and router configuration auditing", "SMB and NFS share inspection", "Metasploit exploit verification"]
      },
      {
        number: 6,
        title: "Professional Reporting and Remediation Advice",
        topics: ["Writing executive summaries", "Documenting proof-of-concept steps", "Actionable remediation guidelines", "Retesting verified patches"]
      }
    ],
    tools: ["Kali Linux", "Nmap", "Burp Suite", "OWASP ZAP", "Nessus", "Metasploit", "Wireshark"],
    handsOn: "Vulnerable-lab practice and a final assessment report on a sample target.",
    careerRoles: ["VAPT Analyst", "Security Analyst", "Application Security Tester", "Vulnerability Management Associate"],
    bannerClass: "cyber-bg",
    icon: "fa-solid fa-shield-virus",
    thumbnail: "/images/vapt.png",
    seoTitle: "VAPT Course in India | Vulnerability Assessment Training – Netcradus Academy",
    metaTitle: "VAPT Course in India | Vulnerability Assessment Training – Netcradus Academy",
    metaDescription: "Master Vulnerability Assessment & Penetration Testing in India. Hands-on training in Kali Linux, Burp Suite, Nessus, and OWASP Top 10 with offline labs in Noida & live hybrid classes.",
    aeoAnswer: "A VAPT Analyst is an offensive cybersecurity professional responsible for identifying, validating, and reporting security weaknesses in web applications, network infrastructure, and APIs before malicious hackers exploit them. Key tools include Burp Suite, Nessus, Nmap, and Metasploit.",
    faqs: [
      {
        q: "Do I need prior hacking experience to join the VAPT Analyst programme?",
        a: "No prior hacking experience is required. The programme starts with Cyber Security and Networking Fundamentals, making it ideal for beginners with basic IT knowledge."
      },
      {
        q: "Are the vulnerability labs completely safe and legal?",
        a: "Yes. All practical assessments and exploitation exercises are conducted within private, isolated Netcradus virtual lab environments adhering to strict ethical guidelines."
      },
      {
        q: "How can I obtain details on batch schedules, fees and enrollment?",
        a: "Please submit an enquiry or speak directly with our admissions advisors via WhatsApp or phone at +91 7290909574."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // PROGRAMME 02: PENETRATION TESTER
  // --------------------------------------------------------------------------
  {
    number: "02",
    code: "PROG-02",
    title: "Penetration Tester",
    slug: "penetration-tester",
    track: "Offensive Security",
    trackId: "offensive-security",
    tagline: "Think like an attacker. Deliver like a professional.",
    overview: "Learn ethical hacking through authorised, multi-stage penetration-testing scenarios, professional methodology and reporting.",
    idealFor: "Learners with networking basics and VAPT graduates.",
    targetAudience: [
      "Graduates of VAPT or foundational security courses",
      "Network engineers and developers transitioning to offensive security",
      "Practitioners seeking to master authorized multi-stage penetration testing"
    ],
    learningOutcomes: [
      "Plan and execute an authorised, multi-stage penetration test.",
      "Understand vulnerability chaining and demonstrate business impact in authorised labs.",
      "Present attack paths and business risks professionally."
    ],
    modules: [
      {
        number: 1,
        title: "Ethical Hacking Methodology and Rules of Engagement",
        topics: ["Scoping and legal boundaries", "Rules of engagement (RoE)", "PTES & NIST penetration testing methodologies", "Ethics of responsible disclosure"]
      },
      {
        number: 2,
        title: "Advanced Enumeration and Exploitation",
        topics: ["Custom payload generation", "Bypassing basic network filters", "Vulnerability chaining concepts", "Exploit customization"]
      },
      {
        number: 3,
        title: "Web, API and Mobile Application Attacks",
        topics: ["REST & GraphQL API testing", "JWT manipulation and OAuth flaws", "Modern client-side exploits", "SQLmap automated exploitation"]
      },
      {
        number: 4,
        title: "Active Directory and Internal Network Attacks",
        topics: ["BloodHound graph analysis", "Kerberoasting and AS-REP roasting", "Pass-the-Hash & Impacket tooling", "Lateral movement strategies"]
      },
      {
        number: 5,
        title: "Privilege Escalation and Post-Exploitation",
        topics: ["Linux kernel & sudo abuse vectors", "Windows token impersonation & DLL hijacking", "Credential harvesting and persistence", "Egress filtering bypass"]
      },
      {
        number: 6,
        title: "Red Team Reporting and Retesting",
        topics: ["Business impact articulation", "Attack chain visualization", "Executive and technical debriefing", "Remediation validation and retesting"]
      }
    ],
    tools: ["Kali Linux", "Burp Suite", "Metasploit", "SQLmap", "BloodHound", "Impacket", "Hydra"],
    handsOn: "Multi-stage lab machines and a complete penetration-test report in authorised, controlled environments.",
    careerRoles: ["Penetration Tester", "Ethical Hacker", "Red Team Associate", "Security Consultant"],
    bannerClass: "cyber-bg",
    icon: "fa-solid fa-user-secret",
    thumbnail: "/images/cyber.png",
    seoTitle: "Penetration Testing Course | Ethical Hacking Training – Netcradus Academy",
    metaTitle: "Penetration Testing Course | Ethical Hacking Training – Netcradus Academy",
    metaDescription: "Learn professional Penetration Testing and Ethical Hacking in India. Hands-on exploitation, Active Directory attacks, web security, and comprehensive technical reporting.",
    aeoAnswer: "A Penetration Tester (ethical hacker) simulates real-world cyberattacks against computer systems, networks, and applications to evaluate their defensive resilience, bypass security controls, and uncover exploitable flaws using tools like Burp Suite Pro, Metasploit, and Kali Linux.",
    faqs: [
      {
        q: "What prerequisites are recommended for Penetration Tester?",
        a: "Learners should have basic networking fundamentals or should have completed a foundational security curriculum like our VAPT Analyst programme."
      },
      {
        q: "Is ethical compliance enforced during the course?",
        a: "Yes. All practical attack simulations are strictly conducted on authorized virtual targets, emphasizing professional methodology and authorized rules of engagement."
      },
      {
        q: "How do I get information regarding fees and upcoming batches?",
        a: "Connect with our admissions desk via the enquiry form or WhatsApp at +91 7290909574 for customized batch schedules."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // PROGRAMME 03: SOC ANALYST
  // --------------------------------------------------------------------------
  {
    number: "03",
    code: "PROG-03",
    title: "SOC Analyst",
    slug: "soc-analyst",
    track: "Defence & Governance",
    trackId: "defence-governance",
    tagline: "Detect, investigate and respond in real time.",
    overview: "Learn security monitoring, alert investigation, threat hunting and incident response using SIEM platforms and structured playbooks.",
    idealFor: "Freshers and IT professionals aiming for defensive security roles.",
    targetAudience: [
      "Fresh computer science / IT graduates pursuing blue team roles",
      "IT support and network technicians moving into security operations",
      "Aspiring cybersecurity professionals interested in incident detection"
    ],
    learningOutcomes: [
      "Triage and investigate security alerts using a SIEM.",
      "Map suspicious activity to MITRE ATT&CK techniques.",
      "Follow incident-response playbooks and write reports."
    ],
    modules: [
      {
        number: 1,
        title: "SOC Fundamentals and the Incident Lifecycle",
        topics: ["SOC architecture (L1, L2, L3 tiers)", "Incident response lifecycle (NIST / SANS)", "Security telemetry sources", "Severity classifications"]
      },
      {
        number: 2,
        title: "Log Analysis and SIEM Operations",
        topics: ["Splunk SPL query syntax", "Elasticsearch & Kibana dashboards", "Sysmon event ID correlation", "Windows Event Viewer analysis"]
      },
      {
        number: 3,
        title: "Threat Detection and Use-Case Building",
        topics: ["Rule authoring in SIEM", "Correlation logic for brute-force attacks", "Detecting lateral movement & exfiltration", "False-positive tuning"]
      },
      {
        number: 4,
        title: "Threat Intelligence and MITRE ATT&CK",
        topics: ["Mapping tactics, techniques and sub-techniques", "Indicators of Compromise (IoCs)", "Threat intelligence feeds integration", "YARA rules basics"]
      },
      {
        number: 5,
        title: "Incident Response and Triage Playbooks",
        topics: ["Phishing email investigation", "Endpoint malware containment", "Ransomware triage playbooks", "Network packet capture with Wireshark"]
      },
      {
        number: 6,
        title: "Alert Investigation Labs and Reporting",
        topics: ["Simulated SOC ticket queues", "Evidence preservation & chain of custody", "Post-incident review documentation", "Executive security briefings"]
      }
    ],
    tools: ["Splunk", "Elastic Stack", "Wazuh", "Sysmon", "Wireshark", "MITRE ATT&CK"],
    handsOn: "Simulated alert queues and a complete incident investigation report.",
    careerRoles: ["SOC Analyst (L1 and L2)", "Threat Detection Analyst", "Incident Responder", "Security Monitoring Analyst"],
    bannerClass: "soc-bg",
    icon: "fa-solid fa-radar",
    thumbnail: "/images/soc.png",
    seoTitle: "SOC Analyst Course | Cyber Security & SIEM Training – Netcradus Academy",
    metaTitle: "SOC Analyst Course | Cyber Security & SIEM Training – Netcradus Academy",
    metaDescription: "Become a job-ready SOC Analyst in India. Master SIEM platforms (Splunk), network traffic analysis with Wireshark, incident response playbooks, and real-time threat triage.",
    aeoAnswer: "A SOC Analyst monitors enterprise networks and cloud environments 24/7 to detect security anomalies, triage automated SIEM alerts, isolate compromised endpoints, and mitigate cyber incidents using platforms like Splunk, Microsoft Sentinel, and Wireshark.",
    faqs: [
      {
        q: "What role can I apply for after completing the SOC Analyst programme?",
        a: "Graduates are equipped for roles such as SOC Analyst (L1 and L2), Threat Detection Analyst, Incident Responder, and Security Monitoring Analyst."
      },
      {
        q: "Will I practice with real SIEM platforms?",
        a: "Yes. Practical sessions use industry-standard platforms including Splunk, Elastic Stack, Wazuh, and Sysmon log analysis."
      },
      {
        q: "How can I inquire about admission and curriculum delivery?",
        a: "Contact our admissions team at academy@netcradus.com or call/WhatsApp +91 7290909574."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // PROGRAMME 04: CLOUD SECURITY ANALYST
  // --------------------------------------------------------------------------
  {
    number: "04",
    code: "PROG-04",
    title: "Cloud Security Analyst",
    slug: "cloud-security-analyst",
    track: "Defence & Governance",
    trackId: "defence-governance",
    tagline: "Secure the cloud where modern business runs.",
    overview: "Learn to secure identities, networks, data and workloads across major cloud platforms.",
    idealFor: "IT and security learners interested in cloud environments.",
    targetAudience: [
      "Cloud administrators and engineers expanding into security",
      "Cybersecurity analysts seeking multi-cloud domain expertise",
      "IT professionals managing AWS, Azure, or GCP workloads"
    ],
    learningOutcomes: [
      "Configure secure identities, networks and storage.",
      "Identify and fix cloud misconfigurations.",
      "Monitor cloud activity and respond to security events."
    ],
    modules: [
      {
        number: 1,
        title: "Cloud Fundamentals and Shared Responsibility Model",
        topics: ["IaaS, PaaS, SaaS security models", "Shared responsibility matrix across AWS, Azure, GCP", "Cloud attack surface overview", "Zero Trust cloud architecture"]
      },
      {
        number: 2,
        title: "Identity and Access Management",
        topics: ["Least privilege policy design", "MFA, SSO and federation", "Role-based access control (RBAC)", "Privileged Identity Management (PIM)"]
      },
      {
        number: 3,
        title: "Network, Storage and Data Protection",
        topics: ["VPC/VNet security architecture", "Security groups and Network ACLs", "S3 and blob storage encryption at rest/transit", "KMS key management"]
      },
      {
        number: 4,
        title: "Misconfiguration and Posture Management",
        topics: ["Auditing with Prowler and ScoutSuite", "Cloud Security Posture Management (CSPM)", "Detecting public buckets and open ports", "Terraform compliance auditing"]
      },
      {
        number: 5,
        title: "Cloud Logging, Monitoring and Threat Detection",
        topics: ["AWS CloudTrail, GuardDuty and CloudWatch", "Azure Monitor and Defender for Cloud", "GCP Cloud Audit Logs", "Cloud threat detection use-cases"]
      },
      {
        number: 6,
        title: "Cloud Compliance and Incident Response",
        topics: ["CIS Cloud Benchmarks", "Automated remediation with Lambda/Functions", "Cloud forensic data collection", "Cloud security incident playbooks"]
      }
    ],
    tools: ["AWS", "Microsoft Azure", "Google Cloud", "Prowler", "ScoutSuite", "Terraform"],
    handsOn: "Securing a sample cloud environment and producing a posture assessment.",
    careerRoles: ["Cloud Security Analyst", "Cloud Security Associate", "Cloud Compliance Analyst", "Cloud SOC Analyst"],
    bannerClass: "cloud-bg",
    icon: "fa-solid fa-cloud-arrow-up",
    thumbnail: "/images/cloud.png",
    seoTitle: "Cloud Security Course | AWS & Azure Defense Training – Netcradus Academy",
    metaTitle: "Cloud Security Course | AWS & Azure Defense Training – Netcradus Academy",
    metaDescription: "Industry-aligned Cloud Security Analyst training in India. Learn IAM governance, AWS/Azure security configurations, container hardening, and multi-cloud compliance.",
    aeoAnswer: "A Cloud Security Analyst designs, implements, and audits security controls across AWS, Azure, and Google Cloud environments, ensuring secure IAM policies, encrypted storage, network micro-segmentation, and compliance with CIS cloud benchmarks.",
    faqs: [
      {
        q: "Does the programme cover multiple cloud providers?",
        a: "Yes. The curriculum covers core security concepts across AWS, Microsoft Azure, and Google Cloud, focusing on the Shared Responsibility Model and multi-cloud posture."
      },
      {
        q: "What hands-on capstone project will I complete?",
        a: "You will secure a sample multi-tier cloud environment and produce a professional Cloud Security Posture Assessment using tools like Prowler and ScoutSuite."
      },
      {
        q: "Where do I find details on fee structure and batches?",
        a: "Our admissions advisors will assist you. Reach out via WhatsApp at +91 7290909574 or email academy@netcradus.com."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // PROGRAMME 05: GRC ANALYST
  // --------------------------------------------------------------------------
  {
    number: "05",
    code: "PROG-05",
    title: "GRC Analyst",
    slug: "grc-analyst",
    track: "Defence & Governance",
    trackId: "defence-governance",
    tagline: "Turn security into trust, policy and compliance.",
    overview: "Learn risk assessment, security policies, compliance frameworks, audit readiness and privacy requirements.",
    idealFor: "Non-coders, auditors, managers and anyone interested in the business side of security.",
    targetAudience: [
      "Non-coders seeking a non-technical entry point into cybersecurity",
      "Auditors, compliance officers, and business analysts",
      "Managers and legal/risk professionals managing governance"
    ],
    learningOutcomes: [
      "Run risk assessments and maintain risk registers.",
      "Map controls to ISO 27001, NIST CSF and SOC 2.",
      "Prepare organisations for audits and privacy compliance."
    ],
    modules: [
      {
        number: 1,
        title: "GRC Foundations and Security Governance",
        topics: ["Governance, Risk and Compliance pillars", "Security leadership and steering committees", "Information security strategy", "Business alignment of security"]
      },
      {
        number: 2,
        title: "Risk Assessment and Treatment",
        topics: ["Qualitative vs. quantitative risk assessment", "Threat and vulnerability identification", "Risk scoring and risk matrices", "Building and maintaining risk registers"]
      },
      {
        number: 3,
        title: "ISO 27001, NIST CSF and SOC 2 Frameworks",
        topics: ["ISO/IEC 27001:2022 clauses and Annex A controls", "NIST Cybersecurity Framework 2.0 (Govern, Identify, Protect, Detect, Respond, Recover)", "SOC 2 Trust Services Criteria"]
      },
      {
        number: 4,
        title: "Policies, Controls and Audit Readiness",
        topics: ["Drafting enterprise security policies", "Access control & Acceptable Use Policies", "Internal audit methodologies", "Gathering audit evidence and managing non-conformities"]
      },
      {
        number: 5,
        title: "Data Privacy and Regulatory Requirements",
        topics: ["GDPR principles, lawful basis and rights", "Digital Personal Data Protection (DPDP) Act", "Data Protection Impact Assessments (DPIA)", "Breach notification obligations"]
      },
      {
        number: 6,
        title: "Third-Party Risk Management and Reporting",
        topics: ["Vendor risk assessments (TPRM)", "Security questionnaires (SIG, CAIQ)", "Executive governance dashboards", "Boardroom risk reporting"]
      }
    ],
    tools: ["ISO 27001", "NIST CSF", "SOC 2", "GDPR", "DPDP Act", "Risk Registers", "Audit Checklists"],
    handsOn: "Build a risk register, policy set and audit-readiness checklist for a sample company.",
    careerRoles: ["GRC Analyst", "Risk Analyst", "Compliance Associate", "IT Auditor", "Privacy Analyst"],
    bannerClass: "grc-bg",
    icon: "fa-solid fa-scale-balanced",
    thumbnail: "/images/socthreats.png",
    seoTitle: "GRC Analyst Course | Governance, Risk & Compliance Training – Netcradus Academy",
    metaTitle: "GRC Analyst Course | Governance, Risk & Compliance Training – Netcradus Academy",
    metaDescription: "Master IT Governance, Risk Management & Compliance in India. Training in ISO 27001, NIST CSF, RBI guidelines, CERT-In compliance, and third-party vendor risk auditing.",
    aeoAnswer: "A GRC Analyst aligns an organization's IT and cybersecurity operations with international security frameworks (ISO 27001, NIST), legal regulations (DPDP Act, GDPR), and conducts structured risk assessments to safeguard institutional integrity.",
    faqs: [
      {
        q: "Do I need coding or software development skills for GRC Analyst?",
        a: "No coding is required. The GRC Analyst programme focuses on the business, policy, compliance, audit, and privacy dimensions of cybersecurity."
      },
      {
        q: "Does the programme cover Indian and international regulations?",
        a: "Yes. The curriculum covers global standards (ISO 27001, NIST CSF, SOC 2, GDPR) as well as the Indian Digital Personal Data Protection (DPDP) Act."
      },
      {
        q: "How can I find out about enrollment and admissions?",
        a: "Submit the quick enquiry form or speak with an admissions advisor at +91 7290909574."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // PROGRAMME 06: AI SECURITY ENGINEER
  // --------------------------------------------------------------------------
  {
    number: "06",
    code: "PROG-06",
    title: "AI Security Engineer",
    slug: "ai-security-engineer",
    track: "Secure Engineering",
    trackId: "secure-engineering",
    tagline: "Protect AI systems from a new generation of threats.",
    overview: "Learn to identify and mitigate AI and LLM security risks, including prompt injection, data leakage and insecure AI pipelines.",
    idealFor: "Security or software learners interested in securing AI-powered products.",
    targetAudience: [
      "Cybersecurity professionals specializing in artificial intelligence security",
      "Software engineers building LLM-integrated products",
      "Data scientists seeking model robustness and guardrail engineering skills"
    ],
    learningOutcomes: [
      "Threat-model an LLM application using OWASP LLM Top 10.",
      "Test AI systems for prompt injection and data leakage.",
      "Design guardrails and monitoring for AI pipelines."
    ],
    modules: [
      {
        number: 1,
        title: "AI, ML and LLM Fundamentals for Security",
        topics: ["Machine learning pipeline architecture", "Foundation models and embeddings", "Vector stores and RAG mechanics", "AI-specific attack vectors"]
      },
      {
        number: 2,
        title: "Prompt Injection, Jailbreaks and Data Leakage",
        topics: ["Direct and indirect prompt injection", "Jailbreak taxonomy and payload generation", "System prompt extraction", "Sensitive data exfiltration via LLMs"]
      },
      {
        number: 3,
        title: "OWASP Top 10 for LLM Applications",
        topics: ["LLM01: Prompt Injection to LLM10: Model Theft", "Insecure output handling and SSRF", "Supply chain vulnerabilities in AI packages", "Overreliance and denial of service"]
      },
      {
        number: 4,
        title: "Adversarial Machine Learning and Model Security",
        topics: ["Data poisoning and backdoor insertion", "Model inversion and membership inference", "Evasion attacks", "MITRE ATLAS matrix navigation"]
      },
      {
        number: 5,
        title: "Securing AI Pipelines, APIs and Data",
        topics: ["Vector database access controls", "API token management and rate limits", "PII redaction and sanitization filters", "Safe agent tool-calling boundaries"]
      },
      {
        number: 6,
        title: "AI Red Teaming and Guardrail Design",
        topics: ["Implementing NeMo Guardrails / Llama Guard", "LLM-assisted red-team fuzzing", "Continuous behavioral monitoring", "Hardening AI deployment environments"]
      }
    ],
    tools: ["Python", "OWASP LLM Top 10", "MITRE ATLAS", "LLM Red-Team Tools", "Guardrail Frameworks", "Burp Suite"],
    handsOn: "Attacking and then hardening a sample LLM application.",
    careerRoles: ["AI Security Engineer", "AI Red Team Associate", "ML Security Analyst", "Application Security Engineer"],
    bannerClass: "ai-sec-bg",
    icon: "fa-solid fa-brain-circuit",
    thumbnail: "/images/gen.png",
    seoTitle: "AI Security Course | LLM Security & AI Red Teaming – Netcradus Academy",
    metaTitle: "AI Security Course | LLM Security & AI Red Teaming – Netcradus Academy",
    metaDescription: "Pioneering AI Security Engineer course in India. Learn LLM red-teaming, prompt injection defense, model hardening, guardrails, and OWASP Top 10 for Large Language Models.",
    aeoAnswer: "An AI Security Engineer protects machine learning models and generative AI systems from adversarial manipulation, prompt injection, data extraction, and model poisoning, implementing robust runtime guardrails and automated safety evaluations.",
    faqs: [
      {
        q: "Why is AI Security a vital career specialization?",
        a: "As enterprises deploy generative AI and LLMs, safeguarding these systems against prompt injection, jailbreaks, data leakage, and insecure tool use is one of the fastest-growing cybersecurity needs."
      },
      {
        q: "What hands-on project is featured?",
        a: "Learners execute a structured attack simulation against an LLM web app, document vulnerabilities, and implement input/output guardrails to secure it."
      },
      {
        q: "How can I obtain batch information?",
        a: "Contact our admissions team directly via WhatsApp (+91 7290909574) or our online enquiry form."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // PROGRAMME 07: DEVSECOPS
  // --------------------------------------------------------------------------
  {
    number: "07",
    code: "PROG-07",
    title: "DevSecOps",
    slug: "devsecops",
    track: "Secure Engineering",
    trackId: "secure-engineering",
    tagline: "Ship fast without shipping vulnerabilities.",
    overview: "Learn to integrate automated security checks into CI/CD pipelines and secure containers, Kubernetes and infrastructure as code.",
    idealFor: "Developers, DevOps and cloud learners.",
    targetAudience: [
      "Software developers adopting shift-left security practices",
      "DevOps engineers integrating automated compliance into pipelines",
      "Cloud practitioners managing container and Kubernetes clusters"
    ],
    learningOutcomes: [
      "Build CI/CD pipelines with automated SAST, DAST and SCA checks.",
      "Harden containers, Kubernetes clusters and IaC templates.",
      "Integrate secrets management and compliance checks."
    ],
    modules: [
      {
        number: 1,
        title: "DevOps and CI/CD Fundamentals",
        topics: ["Continuous Integration and Delivery concepts", "Git workflow best practices", "GitHub Actions and Jenkins architecture", "Build automation basics"]
      },
      {
        number: 2,
        title: "Shift-Left Security Mindset",
        topics: ["The economics of early defect discovery", "Security champion culture", "Pre-commit hooks and IDE linters", "Defining security gates and thresholds"]
      },
      {
        number: 3,
        title: "SAST, DAST and SCA in Pipelines",
        topics: ["Static code analysis with SonarQube", "Software Composition Analysis (SCA) with Trivy/Dependency-Check", "Dynamic testing in pipeline stages", "Managing false positives"]
      },
      {
        number: 4,
        title: "Container and Kubernetes Security",
        topics: ["Dockerfile security best practices", "Rootless container execution", "Base image vulnerability scanning", "Kubernetes NetworkPolicies and RBAC"]
      },
      {
        number: 5,
        title: "Infrastructure as Code Security",
        topics: ["Terraform security scanning with tfsec / Checkov", "Detecting infrastructure misconfigurations before commit", "Enforcing baseline CIS benchmarks in IaC"]
      },
      {
        number: 6,
        title: "Secrets Management and Compliance as Code",
        topics: ["Preventing secrets commit with GitLeaks", "HashiCorp Vault / Cloud Secret Managers", "Open Policy Agent (OPA) policies", "Automated compliance auditing in production"]
      }
    ],
    tools: ["Git", "GitHub Actions", "Jenkins", "Docker", "Kubernetes", "SonarQube", "Trivy", "Terraform"],
    handsOn: "Build a secured CI/CD pipeline for a sample application.",
    careerRoles: ["DevSecOps Engineer", "Security Automation Engineer", "Cloud or DevOps Engineer", "Application Security Engineer"],
    bannerClass: "devops-bg",
    icon: "fa-solid fa-code-branch",
    thumbnail: "/images/devops.png",
    seoTitle: "DevSecOps Course | CI/CD & Cloud Security Training – Netcradus Academy",
    metaTitle: "DevSecOps Course | CI/CD & Cloud Security Training – Netcradus Academy",
    metaDescription: "Advance your career with practical DevSecOps training in India. Master automated SAST/DAST security scanning, CI/CD pipelines, Docker container security, and Kubernetes compliance.",
    aeoAnswer: "A DevSecOps Engineer integrates automated security testing, static code analysis (SAST), software composition analysis (SCA), and container vulnerability scans directly into continuous integration and delivery (CI/CD) pipelines to shift security left.",
    faqs: [
      {
        q: "What programming knowledge is needed for DevSecOps?",
        a: "Basic familiarity with software development, Git commands, or cloud/Linux operations is helpful for getting the most out of pipeline automation."
      },
      {
        q: "What practical pipeline will I build?",
        a: "You will build a full CI/CD pipeline incorporating automated code analysis (SAST), dependency auditing (SCA), container vulnerability scanning, and IaC verification."
      },
      {
        q: "How can I inquire about batch dates and admissions?",
        a: "Contact our admissions desk via phone/WhatsApp at +91 7290909574 or email academy@netcradus.com."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // PROGRAMME 08: AI DEVELOPER
  // --------------------------------------------------------------------------
  {
    number: "08",
    code: "PROG-08",
    title: "AI Developer",
    slug: "ai-developer",
    track: "AI & Automation",
    trackId: "ai-automation",
    tagline: "Build intelligent applications that solve real problems.",
    overview: "Learn Python, machine learning, deep learning, NLP, LLM integration and AI application deployment.",
    idealFor: "Students and developers who want to build AI products.",
    targetAudience: [
      "Computer science and engineering students wanting to enter AI",
      "Software developers transitioning into machine learning and LLM engineering",
      "Aspiring data scientists aiming to build production AI applications"
    ],
    learningOutcomes: [
      "Build and evaluate ML and deep learning models in Python.",
      "Integrate LLM APIs and retrieval into applications.",
      "Deploy models as APIs and present a working project."
    ],
    modules: [
      {
        number: 1,
        title: "Python for AI",
        topics: ["Python programming for data workflows", "Vectorized computing with NumPy", "Data manipulation and cleaning with Pandas", "Data visualization"]
      },
      {
        number: 2,
        title: "Machine Learning Essentials",
        topics: ["Supervised vs. unsupervised learning", "Classification, regression, and clustering", "scikit-learn model training and hyperparameter tuning", "Model evaluation metrics"]
      },
      {
        number: 3,
        title: "Deep Learning and Neural Networks",
        topics: ["Perceptrons and multi-layer networks", "PyTorch and TensorFlow foundations", "Convolutional and recurrent networks", "Transfer learning techniques"]
      },
      {
        number: 4,
        title: "NLP and LLM Integration",
        topics: ["Text preprocessing and tokenization", "Word embeddings and vector representations", "Hugging Face Transformers ecosystem", "Calling OpenAI, Anthropic & Gemini APIs"]
      },
      {
        number: 5,
        title: "Building AI Apps and APIs",
        topics: ["FastAPI microservice development for models", "Retrieval-Augmented Generation (RAG) concepts", "Connecting vector databases", "Front-end integration basics"]
      },
      {
        number: 6,
        title: "Deployment and Capstone Project",
        topics: ["Containerizing AI applications with Docker", "Cloud API deployment", "Performance optimization and latency tuning", "Final capstone project presentation"]
      }
    ],
    tools: ["Python", "NumPy", "Pandas", "scikit-learn", "PyTorch", "TensorFlow", "Hugging Face", "FastAPI"],
    handsOn: "Mini-projects in every module and a deployed capstone application.",
    careerRoles: ["AI Developer", "Junior ML Engineer", "Python Developer (AI)", "Data Science Associate"],
    bannerClass: "ai-bg",
    icon: "fa-solid fa-code",
    thumbnail: "/images/ai.png",
    seoTitle: "AI Developer Course | Machine Learning & AI Training – Netcradus Academy",
    metaTitle: "AI Developer Course | Machine Learning & AI Training – Netcradus Academy",
    metaDescription: "Hands-on AI Developer training in India. Build machine learning models, fine-tune LLMs, integrate APIs, and deploy production-grade AI solutions using Python and PyTorch.",
    aeoAnswer: "An AI Developer designs, trains, fine-tunes, and deploys machine learning models and generative AI solutions into enterprise software architectures using Python, modern deep learning frameworks, and vector search databases.",
    faqs: [
      {
        q: "Do I need an advanced mathematics degree for this programme?",
        a: "No. The course provides intuitive, practical coverage of linear algebra and statistics essentials alongside hands-on Python coding."
      },
      {
        q: "Will I learn both traditional machine learning and modern LLMs?",
        a: "Yes. The curriculum covers foundational ML/deep learning with scikit-learn and PyTorch, as well as modern LLM integration and RAG with FastAPI."
      },
      {
        q: "How do I get information regarding fees and schedules?",
        a: "Inquire through our admissions team via WhatsApp (+91 7290909574) or submit an enquiry on this website."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // PROGRAMME 09: AI AUTOMATION
  // --------------------------------------------------------------------------
  {
    number: "09",
    code: "PROG-09",
    title: "AI Automation",
    slug: "ai-automation",
    track: "AI & Automation",
    trackId: "ai-automation",
    tagline: "Let intelligent workflows do the repetitive work.",
    overview: "Learn to connect applications, data and AI to automate business workflows.",
    idealFor: "Beginners, business professionals and freelancers. No programming background is required to start.",
    targetAudience: [
      "Beginners seeking high-leverage digital automation skills",
      "Business professionals and operations managers streamlining work",
      "Freelancers building workflow automation services for clients"
    ],
    learningOutcomes: [
      "Map business processes and identify automation opportunities.",
      "Build workflows using n8n, Zapier or Make.",
      "Monitor, secure and maintain automations."
    ],
    modules: [
      {
        number: 1,
        title: "Automation Thinking and Process Mapping",
        topics: ["Deconstructing repetitive workflows", "Identifying automation ROI", "Process flowcharting and event triggers", "Designing error-resistant logic"]
      },
      {
        number: 2,
        title: "No-Code and Low-Code Workflow Platforms",
        topics: ["n8n open-source workflow builder", "Zapier and Make.com architectures", "Triggers, actions, filters, and branching", "Data mapping across nodes"]
      },
      {
        number: 3,
        title: "APIs, Webhooks and Integrations",
        topics: ["Understanding REST APIs and HTTP methods", "Configuring incoming and outgoing webhooks", "Authentication (API keys, OAuth2)", "Parsing JSON payloads"]
      },
      {
        number: 4,
        title: "AI-Powered Automations with LLMs",
        topics: ["Embedding LLM calls into workflows", "Automated text summarization and routing", "Sentiment analysis on customer feedback", "Dynamic prompt templating in pipelines"]
      },
      {
        number: 5,
        title: "Document, Email and Data Automation",
        topics: ["Automating Google Workspace & Microsoft 365", "PDF data extraction and invoice processing", "CRM sync (leads, customer records)", "Automated notifications"]
      },
      {
        number: 6,
        title: "Monitoring, Error Handling and Scaling",
        topics: ["Handling API rate limits and failed executions", "Retry mechanisms and error notifications", "Securing API keys and webhook secrets", "Final business automation project"]
      }
    ],
    tools: ["n8n", "Zapier", "Make", "Python", "REST APIs", "Google Workspace", "LLM APIs"],
    handsOn: "Several working automations and a final business-workflow project.",
    careerRoles: ["AI Automation Specialist", "Workflow Automation Engineer", "Business Process Analyst", "Automation Consultant"],
    bannerClass: "automation-bg",
    icon: "fa-solid fa-gears",
    thumbnail: "/images/science.png",
    seoTitle: "AI Automation Course | Workflow & RPA Engineering Training – Netcradus Academy",
    metaTitle: "AI Automation Course | Workflow & RPA Engineering Training – Netcradus Academy",
    metaDescription: "Master Enterprise AI Automation in India. Learn to combine Large Language Models with robotic process automation, API webhooks, and intelligent business workflows.",
    aeoAnswer: "An AI Automation Specialist designs autonomous business workflows by integrating Large Language Models with Robotic Process Automation (RPA), webhooks, and cloud APIs to eliminate manual corporate friction and accelerate operational throughput.",
    faqs: [
      {
        q: "Is programming required to start this programme?",
        a: "No. No programming background is required to start. The programme covers no-code and low-code platforms like n8n, Make, and Zapier, introducing Python concepts as optional enhancements."
      },
      {
        q: "What types of workflows will I build?",
        a: "You will build lead qualification automations, invoice/document data extractors, automated customer support routing, and multi-app data synchronization pipelines."
      },
      {
        q: "How can I contact admissions for enrollment guidance?",
        a: "Reach our team via WhatsApp at +91 7290909574 or email academy@netcradus.com."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // PROGRAMME 10: AGENTIC AI
  // --------------------------------------------------------------------------
  {
    number: "10",
    code: "PROG-10",
    title: "Agentic AI",
    slug: "agentic-ai",
    track: "AI & Automation",
    trackId: "ai-automation",
    tagline: "Design AI agents that plan, decide and act.",
    overview: "Learn to build intelligent agents that use tools, memory, retrieval and multi-step workflows.",
    idealFor: "Learners with basic programming skills.",
    targetAudience: [
      "Developers with basic programming skills seeking autonomous agent mastery",
      "AI engineers expanding beyond simple chatbots to agentic architectures",
      "Technologists building multi-agent systems and MCP integrations"
    ],
    learningOutcomes: [
      "Design agents that use tools, memory and retrieval.",
      "Orchestrate multi-agent workflows using LangGraph or CrewAI.",
      "Evaluate, safeguard and deploy agent systems."
    ],
    modules: [
      {
        number: 1,
        title: "From LLMs to Autonomous Agents",
        topics: ["Limitations of simple prompt-response models", "The ReAct (Reason + Act) loop pattern", "Plan-and-solve agent patterns", "State machines in agent design"]
      },
      {
        number: 2,
        title: "Tool Use and Function Calling",
        topics: ["Model Context Protocol (MCP) standards", "Defining function schemas for LLMs", "Web browsing and code execution tools", "Validating tool arguments safely"]
      },
      {
        number: 3,
        title: "Memory, RAG and Knowledge Retrieval",
        topics: ["Short-term conversational buffer memory", "Long-term episodic and semantic memory", "Connecting vector databases for dynamic context", "Entity memory graphs"]
      },
      {
        number: 4,
        title: "Multi-Agent Orchestration",
        topics: ["Orchestrating agents with LangGraph", "Role-playing swarms with CrewAI", "Hierarchical vs. collaborative agent teams", "Conflict resolution and delegation"]
      },
      {
        number: 5,
        title: "Evaluation, Guardrails and Safety",
        topics: ["Detecting runaway agent loops", "Human-in-the-loop approvals", "Benchmarking agent task completion", "Enforcing agent security boundaries"]
      },
      {
        number: 6,
        title: "Building and Deploying Agent Systems",
        topics: ["Deploying agents as asynchronous backend services", "Streaming agent thought processes", "Observability with LangSmith / Tracing", "Deployed multi-agent capstone project"]
      }
    ],
    tools: ["Python", "LangChain", "LangGraph", "CrewAI", "MCP", "Vector Databases", "LLM APIs"],
    handsOn: "Research, support and workflow agents, plus a deployed multi-agent capstone.",
    careerRoles: ["Agentic AI Developer", "AI Agent Engineer", "LLM Application Developer", "AI Solutions Engineer"],
    bannerClass: "agentic-bg",
    icon: "fa-solid fa-network-wired",
    thumbnail: "/images/cyber-course-card.png",
    seoTitle: "Agentic AI Course | AI Agents & LangGraph Training – Netcradus Academy",
    metaTitle: "Agentic AI Course | AI Agents & LangGraph Training – Netcradus Academy",
    metaDescription: "Cutting-edge Agentic AI course in India. Build autonomous multi-agent systems, reasoning loops, memory structures, and custom tool integrations using LangGraph and CrewAI.",
    aeoAnswer: "An Agentic AI Specialist engineers autonomous artificial intelligence agents capable of complex goal decomposition, tool execution, long-term memory retrieval, and self-correcting iteration using frameworks like LangGraph and CrewAI.",
    faqs: [
      {
        q: "What makes Agentic AI different from regular LLM prompting?",
        a: "Agentic AI systems can autonomously plan steps, use external tools (browsers, databases, APIs), maintain state and memory, and collaborate in multi-agent teams without step-by-step human intervention."
      },
      {
        q: "What frameworks are covered?",
        a: "The curriculum covers Python, LangChain, LangGraph, CrewAI, Model Context Protocol (MCP), and Vector Databases."
      },
      {
        q: "How can I learn about admissions and fees?",
        a: "Speak with our admissions counselors at +91 7290909574 or submit an enquiry via this portal."
      }
    ]
  },

  // --------------------------------------------------------------------------
  // PROGRAMME 11: PROMPT ENGINEER
  // --------------------------------------------------------------------------
  {
    number: "11",
    code: "PROG-11",
    title: "Prompt Engineer",
    slug: "prompt-engineer",
    track: "AI & Automation",
    trackId: "ai-automation",
    tagline: "Speak AI's language and get precise results.",
    overview: "Learn prompt design, prompt chains, structured outputs and systematic prompt evaluation.",
    idealFor: "Technical and non-technical learners.",
    targetAudience: [
      "Technical and non-technical learners wanting precise control over AI models",
      "Content creators, marketers, product managers, and knowledge workers",
      "Developers integrating structured prompt templates into production apps"
    ],
    learningOutcomes: [
      "Write clear, structured prompts.",
      "Chain prompts and generate structured outputs.",
      "Test, score and improve prompts."
    ],
    modules: [
      {
        number: 1,
        title: "How Large Language Models Work",
        topics: ["Next-token prediction mechanics", "Attention mechanism intuition", "Temperature, Top-P and repetition penalties", "Context windows and tokenization limits"]
      },
      {
        number: 2,
        title: "Prompt Design Principles",
        topics: ["Clarity, specificity, and constraints", "Role assignment and perspective steering", "Delimiters and input sectioning", "Negative constraints and avoidance"]
      },
      {
        number: 3,
        title: "Few-Shot, Chain-of-Thought and Role Prompting",
        topics: ["Zero-shot vs. few-shot exemplar selection", "Chain-of-Thought (CoT) and Least-to-Most prompting", "ReAct and Tree of Thoughts patterns", "System instruction design"]
      },
      {
        number: 4,
        title: "Structured Outputs and Prompt Chaining",
        topics: ["Guaranteed JSON schema generation", "Pydantic parsing integration", "Building multi-step prompt pipelines", "Handling format degradation"]
      },
      {
        number: 5,
        title: "Evaluating and Optimising Prompts",
        topics: ["Building prompt benchmark test suites", "LLM-as-a-judge evaluation scoring", "A/B testing prompt variants", "Cost, token and latency optimization"]
      },
      {
        number: 6,
        title: "Prompting for Business Use and Prompt Security",
        topics: ["Enterprise prompt libraries for marketing, HR, legal", "Defending against prompt injection in templates", "Prompt version control", "Final prompt library capstone"]
      }
    ],
    tools: ["ChatGPT", "Claude", "Gemini", "LLM APIs", "Prompt Libraries", "Evaluation Sheets"],
    handsOn: "Design and test a prompt library for a chosen business function.",
    careerRoles: ["Prompt Engineer", "AI Content Specialist", "Conversational AI Designer", "AI Operations Associate"],
    bannerClass: "prompt-bg",
    icon: "fa-solid fa-wand-magic-sparkles",
    thumbnail: "/images/hero.png",
    seoTitle: "Prompt Engineering Course | Enterprise LLM Training – Netcradus Academy",
    metaTitle: "Prompt Engineering Course | Enterprise LLM Training – Netcradus Academy",
    metaDescription: "Learn professional Prompt Engineering in India. Master advanced prompt patterns, few-shot prompting, chain-of-thought reasoning, and LLM evaluation benchmarks.",
    aeoAnswer: "A Prompt Engineer crafts, optimizes, and systematically evaluates contextual instructions and structured templates for Large Language Models to maximize output precision, consistency, and compliance in production enterprise applications.",
    faqs: [
      {
        q: "Is this programme suitable for non-technical individuals?",
        a: "Yes. Both technical and non-technical learners can master prompt design principles, structured outputs, and evaluation methodologies."
      },
      {
        q: "What will I create in the practical capstone?",
        a: "You will design, test, benchmark, and document a production-ready prompt library tailored to a chosen business function such as customer support, technical analysis, or content operations."
      },
      {
        q: "How can I reach the admissions team?",
        a: "Reach out via WhatsApp at +91 7290909574 or email academy@netcradus.com."
      }
    ]
  }
];

export const LEARNING_JOURNEY_STAGES = [
  {
    stage: 1,
    title: "Build Foundations",
    subtitle: "Core concepts so beginners and experienced learners start on solid ground.",
    description: "Every programme begins with essential principles—from computer networking and security hygiene to foundational Python and model mechanics—ensuring every learner develops confident conceptual fluency before touching complex tools.",
    icon: "fa-solid fa-layer-group",
    accent: "#f59e0b"
  },
  {
    stage: 2,
    title: "Practise in Labs",
    subtitle: "Guided practical exercises using professional tools.",
    description: "Theory is immediately applied inside structured virtual sandboxes and industry-grade toolkits. Learners run scans, triage alerts, build automated pipelines, and test guardrails in controlled, realistic environments.",
    icon: "fa-solid fa-flask-vial",
    accent: "#3b82f6"
  },
  {
    stage: 3,
    title: "Create a Capstone",
    subtitle: "A real-world-style project learners can present to employers and colleges.",
    description: "Every programme culminates in a comprehensive capstone deliverable—such as an audit-readiness package, vulnerability assessment report, or deployed AI automation—that showcases tangible problem-solving ability to hiring teams.",
    icon: "fa-solid fa-trophy",
    accent: "#10b981"
  },
  {
    stage: 4,
    title: "Get Career-Ready",
    subtitle: "Profile building and interview preparation for the target role.",
    description: "Learners refine their technical portfolio, align their resumes with actual job descriptions, review technical interview questions, and practice presenting findings and methodologies to prospective employers.",
    icon: "fa-solid fa-briefcase",
    accent: "#8b5cf6"
  }
];

export const WHO_CAN_JOIN = [
  {
    id: "students",
    title: "Students",
    badge: "Degree Enhancement",
    icon: "fa-solid fa-user-graduate",
    description: "Add in-demand skills to their degree and stand out in campus and off-campus hiring.",
    details: "College students gain practical lab credentials, hands-on tool experience, and capstone projects that set their resumes apart during campus placements and technical evaluations."
  },
  {
    id: "fresh-graduates",
    title: "Fresh Graduates",
    badge: "Job-Ready Transition",
    icon: "fa-solid fa-graduation-cap",
    description: "Turn qualifications into focused, job-ready skills.",
    details: "Bridging the gap between academic theory and real-world technology operations, fresh graduates learn the exact workflows, playbooks, and platforms used daily in enterprise teams."
  },
  {
    id: "working-professionals",
    title: "Working Professionals",
    badge: "Career Upskilling",
    icon: "fa-solid fa-laptop-code",
    description: "Upskill into security, AI or automation.",
    details: "IT staff, system administrators, and developers can modernize their skill set by mastering offensive security, cloud posture, SIEM operations, DevSecOps, or agentic artificial intelligence."
  },
  {
    id: "career-switchers",
    title: "Career Switchers",
    badge: "Structured Pivot",
    icon: "fa-solid fa-shuffle",
    description: "Move into high-growth fields through structured learning.",
    details: "Professionals from non-technical, auditing, management, or related domains can make a guided entry into high-demand technology sectors through foundational tracks like GRC Analyst and AI Automation."
  }
];

export const CAREER_INTEREST_MATRIX = [
  {
    interest: "Finding and breaking weaknesses in systems",
    recommendedSlugs: ["vapt-analyst", "penetration-tester"],
    track: "Offensive Security",
    icon: "fa-solid fa-crosshairs",
    color: "#ef4444"
  },
  {
    interest: "Watching for threats and responding to incidents",
    recommendedSlugs: ["soc-analyst"],
    track: "Defence & Governance",
    icon: "fa-solid fa-shield-halved",
    color: "#3b82f6"
  },
  {
    interest: "Policies, audits and business security",
    recommendedSlugs: ["grc-analyst"],
    track: "Defence & Governance",
    icon: "fa-solid fa-scale-balanced",
    color: "#8b5cf6"
  },
  {
    interest: "Securing cloud, code pipelines or AI products",
    recommendedSlugs: ["cloud-security-analyst", "devsecops", "ai-security-engineer"],
    track: "Secure Engineering & Defence",
    icon: "fa-solid fa-code-merge",
    color: "#10b981"
  },
  {
    interest: "Building intelligent applications and agents",
    recommendedSlugs: ["ai-developer", "agentic-ai"],
    track: "AI & Automation",
    icon: "fa-solid fa-brain",
    color: "#f59e0b"
  },
  {
    interest: "Saving time through workflows and smart prompts",
    recommendedSlugs: ["ai-automation", "prompt-engineer"],
    track: "AI & Automation",
    icon: "fa-solid fa-wand-magic-sparkles",
    color: "#ec4899"
  }
];

export const GENERAL_FAQS = [
  {
    q: "Which programmes are available at Netcradus Academy?",
    a: "Netcradus Academy offers 11 career-focused programmes across four tracks: Offensive Security (VAPT Analyst, Penetration Tester), Defence & Governance (SOC Analyst, Cloud Security Analyst, GRC Analyst), Secure Engineering (AI Security Engineer, DevSecOps), and AI & Automation (AI Developer, AI Automation, Agentic AI, Prompt Engineer)."
  },
  {
    q: "How do I select the right programme for my goals?",
    a: "You can match your interests using our 'Programmes at a Glance' comparison page or career matrix. Whether you want to break systems (Offensive), defend organizations (SOC/Cloud), manage compliance (GRC), automate workflows (AI Automation), or build AI models (AI Developer), our admissions advisors can also review your profile to recommend the optimal track."
  },
  {
    q: "Can beginners join without previous technical background?",
    a: "Yes. Several programmes—including VAPT Analyst, GRC Analyst, AI Automation, and Prompt Engineer—are tailored for beginners and non-programmers, starting from core foundational concepts before progressing into practical skills."
  },
  {
    q: "Are practical labs and capstones included in the curriculum?",
    a: "Yes. Every single programme includes structured hands-on lab exercises using professional industry tools, culminating in a real-world capstone project or assessment report you can present to prospective employers."
  },
  {
    q: "Which tools will I learn?",
    a: "You will train on industry-standard platforms specific to your track—including Kali Linux, Burp Suite, Splunk, Elastic Stack, AWS, Azure, ISO 27001 checklists, Docker, Kubernetes, Python, PyTorch, n8n, Make, LangGraph, and CrewAI."
  },
  {
    q: "Are programmes suitable for working professionals?",
    a: "Yes. The modular curriculum is structured to accommodate working professionals and college students looking to upskill or transition into high-growth technology disciplines."
  },
  {
    q: "Are institutional batches and college workshops available?",
    a: "Yes. Netcradus Academy discusses tailored workshops, skill development programmes, and placement-oriented batches for colleges, universities, and academic institutions."
  },
  {
    q: "How can I get accurate information about programme fees and batch schedules?",
    a: "The official brochure does not specify fixed fee structures or batch schedules because cohorts are arranged based on intake cycles. Please submit an enquiry form or contact our admissions team directly at academy@netcradus.com or +91 7290909574 for verified, up-to-date schedule and fee information."
  },
  {
    q: "How can I contact the Netcradus Academy admissions team?",
    a: "You can reach our team by email at academy@netcradus.com, by phone or WhatsApp at +91 7290909574, or by submitting an enquiry through any of the forms across this website."
  }
];

export const getProgrammeBySlug = (slug) => {
  if (!slug) return null;
  const normalized = slug.toLowerCase().trim();
  // Direct match
  const found = PROGRAMMES.find((p) => p.slug === normalized);
  if (found) return found;

  // Legacy mappings for backwards-compatibility
  const legacyMap = {
    cyber: "vapt-analyst",
    "vapt-analyst": "vapt-analyst",
    "penetration-testing": "penetration-tester",
    soc: "soc-analyst",
    "soc-analyst": "soc-analyst",
    cloud: "cloud-security-analyst",
    "cloud-security-analyst": "cloud-security-analyst",
    "cloud-engineer": "cloud-security-analyst",
    ai: "ai-developer",
    "ai-developer": "ai-developer",
    "ai-ml": "ai-developer",
    fullstack: "devsecops",
    data: "ai-automation"
  };

  const targetSlug = legacyMap[normalized];
  if (targetSlug) {
    return PROGRAMMES.find((p) => p.slug === targetSlug) || null;
  }

  return null;
};

export const getProgrammesByTrack = (trackId) => {
  if (!trackId || trackId === "all") return PROGRAMMES;
  return PROGRAMMES.filter((p) => p.trackId === trackId);
};

export const searchProgrammes = (query, category = "all") => {
  let list = category === "all" ? PROGRAMMES : getProgrammesByTrack(category);
  if (!query || !query.trim()) return list;

  const q = query.toLowerCase().trim();
  return list.filter((p) => {
    return (
      p.title.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.overview.toLowerCase().includes(q) ||
      p.track.toLowerCase().includes(q) ||
      p.careerRoles.some((r) => r.toLowerCase().includes(q)) ||
      p.tools.some((t) => t.toLowerCase().includes(q))
    );
  });
};

