/**
 * Netcradus Emerging Technologies Programme - Official Course Catalog Seed Data
 * Source of Truth: Netcradus Emerging Technologies Programme Brochure
 */

const coursesSeedData = [
  // --------------------------------------------------------------------------
  // TRACK 1: OFFENSIVE SECURITY
  // --------------------------------------------------------------------------
  {
    title: "VAPT Analyst",
    slug: "vapt-analyst",
    track: "Offensive Security",
    category: "Offensive Security",
    tagline: "Find the weaknesses before attackers do.",
    shortDescription: "Learn to discover, validate and report security weaknesses in web applications, networks and infrastructure.",
    description: "Learn to discover, validate and report security weaknesses in web applications, networks and infrastructure through structured vulnerability assessments, OWASP Top 10 hands-on testing, and enterprise remediation reporting.",
    thumbnail: "/images/vapt.png",
    level: "Beginner to Intermediate",
    bannerClass: "cyber-bg",
    bannerIcon: "fa-solid fa-shield-virus",
    idealFor: "Beginners with basic IT knowledge, students and IT staff moving into security.",
    learningOutcomes: [
      "Run a structured vulnerability assessment from scoping to retest.",
      "Identify and exploit common OWASP Top 10 flaws in a safe lab.",
      "Write clear findings with severity ratings and remediation advice."
    ],
    curriculum: [
      "Cyber Security and Networking Fundamentals",
      "Reconnaissance and Enumeration",
      "Vulnerability Scanning and Triage",
      "Web Application Testing (OWASP Top 10)",
      "Network and Infrastructure Assessment",
      "Professional Reporting and Remediation Advice"
    ],
    tools: ["Kali Linux", "Nmap", "Burp Suite", "OWASP ZAP", "Nessus", "Metasploit", "Wireshark"],
    handsOn: "Vulnerable-lab practice and a final assessment report on a sample target.",
    roles: ["VAPT Analyst", "Security Analyst", "Application Security Tester", "Vulnerability Management Associate"],
    tags: ["Offensive Security", "VAPT", "OWASP", "Vulnerability Assessment", "Cyber Security"],
    published: true,
    featured: true
  },
  {
    title: "Penetration Tester",
    slug: "penetration-tester",
    track: "Offensive Security",
    category: "Offensive Security",
    tagline: "Think like an attacker. Deliver like a professional.",
    shortDescription: "Learn ethical hacking through authorised, multi-stage penetration-testing scenarios, professional methodology and reporting.",
    description: "Learn ethical hacking through authorised, multi-stage penetration-testing scenarios, professional methodology and reporting. Master attack paths, privilege escalation, and active directory engagements in controlled lab environments.",
    thumbnail: "/images/cyber.png",
    level: "Intermediate to Advanced",
    bannerClass: "cyber-bg",
    bannerIcon: "fa-solid fa-user-secret",
    idealFor: "Learners with networking basics and VAPT graduates.",
    learningOutcomes: [
      "Plan and execute an authorised, multi-stage penetration test.",
      "Understand vulnerability chaining and demonstrate business impact in authorised labs.",
      "Present attack paths and business risks professionally."
    ],
    curriculum: [
      "Ethical Hacking Methodology and Rules of Engagement",
      "Advanced Enumeration and Exploitation",
      "Web, API and Mobile Application Attacks",
      "Active Directory and Internal Network Attacks",
      "Privilege Escalation and Post-Exploitation",
      "Red Team Reporting and Retesting"
    ],
    tools: ["Kali Linux", "Burp Suite", "Metasploit", "SQLmap", "BloodHound", "Impacket", "Hydra"],
    handsOn: "Multi-stage lab machines and a complete penetration-test report in authorised, controlled environments.",
    roles: ["Penetration Tester", "Ethical Hacker", "Red Team Associate", "Security Consultant"],
    tags: ["Offensive Security", "Penetration Testing", "Ethical Hacking", "Red Team", "Active Directory"],
    published: true,
    featured: true
  },

  // --------------------------------------------------------------------------
  // TRACK 2: DEFENCE & GOVERNANCE
  // --------------------------------------------------------------------------
  {
    title: "SOC Analyst",
    slug: "soc-analyst",
    track: "Defence & Governance",
    category: "Defence & Governance",
    tagline: "Detect, investigate and respond in real time.",
    shortDescription: "Learn security monitoring, alert investigation, threat hunting and incident response using SIEM platforms and structured playbooks.",
    description: "Learn security monitoring, alert investigation, threat hunting and incident response using SIEM platforms and structured playbooks. Map adversarial activity to MITRE ATT&CK techniques and lead structured incident containment.",
    thumbnail: "/images/soc.png",
    level: "Beginner to Intermediate",
    bannerClass: "soc-bg",
    bannerIcon: "fa-solid fa-radar",
    idealFor: "Freshers and IT professionals aiming for defensive security roles.",
    learningOutcomes: [
      "Triage and investigate security alerts using a SIEM.",
      "Map suspicious activity to MITRE ATT&CK techniques.",
      "Follow incident-response playbooks and write reports."
    ],
    curriculum: [
      "SOC Fundamentals and the Incident Lifecycle",
      "Log Analysis and SIEM Operations",
      "Threat Detection and Use-Case Building",
      "Threat Intelligence and MITRE ATT&CK",
      "Incident Response and Triage Playbooks",
      "Alert Investigation Labs and Reporting"
    ],
    tools: ["Splunk", "Elastic Stack", "Wazuh", "Sysmon", "Wireshark", "MITRE ATT&CK"],
    handsOn: "Simulated alert queues and a complete incident investigation report.",
    roles: ["SOC Analyst (L1 and L2)", "Threat Detection Analyst", "Incident Responder", "Security Monitoring Analyst"],
    tags: ["Defence & Governance", "SOC", "SIEM", "Incident Response", "Threat Hunting", "Splunk"],
    published: true,
    featured: true
  },
  {
    title: "Cloud Security Analyst",
    slug: "cloud-security-analyst",
    track: "Defence & Governance",
    category: "Defence & Governance",
    tagline: "Secure the cloud where modern business runs.",
    shortDescription: "Learn to secure identities, networks, data and workloads across major cloud platforms.",
    description: "Learn to secure identities, networks, data and workloads across major cloud platforms. Detect misconfigurations, govern access policies, and audit multi-cloud infrastructure.",
    thumbnail: "/images/cloud.png",
    level: "Intermediate",
    bannerClass: "cloud-bg",
    bannerIcon: "fa-solid fa-cloud-arrow-up",
    idealFor: "IT and security learners interested in cloud environments.",
    learningOutcomes: [
      "Configure secure identities, networks and storage.",
      "Identify and fix cloud misconfigurations.",
      "Monitor cloud activity and respond to security events."
    ],
    curriculum: [
      "Cloud Fundamentals and Shared Responsibility Model",
      "Identity and Access Management",
      "Network, Storage and Data Protection",
      "Misconfiguration and Posture Management",
      "Cloud Logging, Monitoring and Threat Detection",
      "Cloud Compliance and Incident Response"
    ],
    tools: ["AWS", "Microsoft Azure", "Google Cloud", "Prowler", "ScoutSuite", "Terraform"],
    handsOn: "Securing a sample cloud environment and producing a posture assessment.",
    roles: ["Cloud Security Analyst", "Cloud Security Associate", "Cloud Compliance Analyst", "Cloud SOC Analyst"],
    tags: ["Defence & Governance", "Cloud Security", "AWS", "Azure", "GCP", "Posture Management"],
    published: true,
    featured: true
  },
  {
    title: "GRC Analyst",
    slug: "grc-analyst",
    track: "Defence & Governance",
    category: "Defence & Governance",
    tagline: "Turn security into trust, policy and compliance.",
    shortDescription: "Learn risk assessment, security policies, compliance frameworks, audit readiness and privacy requirements.",
    description: "Learn risk assessment, security policies, compliance frameworks, audit readiness and privacy requirements. Master ISO 27001, NIST CSF, SOC 2, and data privacy governance.",
    thumbnail: "/images/socthreats.png",
    level: "Beginner to Professional",
    bannerClass: "grc-bg",
    bannerIcon: "fa-solid fa-scale-balanced",
    idealFor: "Non-coders, auditors, managers and anyone interested in the business side of security.",
    learningOutcomes: [
      "Run risk assessments and maintain risk registers.",
      "Map controls to ISO 27001, NIST CSF and SOC 2.",
      "Prepare organisations for audits and privacy compliance."
    ],
    curriculum: [
      "GRC Foundations and Security Governance",
      "Risk Assessment and Treatment",
      "ISO 27001, NIST CSF and SOC 2 Frameworks",
      "Policies, Controls and Audit Readiness",
      "Data Privacy and Regulatory Requirements",
      "Third-Party Risk Management and Reporting"
    ],
    tools: ["ISO 27001", "NIST CSF", "SOC 2", "GDPR", "DPDP Act", "Risk Registers", "Audit Checklists"],
    handsOn: "Build a risk register, policy set and audit-readiness checklist for a sample company.",
    roles: ["GRC Analyst", "Risk Analyst", "Compliance Associate", "IT Auditor", "Privacy Analyst"],
    tags: ["Defence & Governance", "GRC", "ISO 27001", "NIST", "Compliance", "Risk Assessment"],
    published: true,
    featured: true
  },

  // --------------------------------------------------------------------------
  // TRACK 3: SECURE ENGINEERING
  // --------------------------------------------------------------------------
  {
    title: "AI Security Engineer",
    slug: "ai-security-engineer",
    track: "Secure Engineering",
    category: "Secure Engineering",
    tagline: "Protect AI systems from a new generation of threats.",
    shortDescription: "Learn to identify and mitigate AI and LLM security risks, including prompt injection, data leakage and insecure AI pipelines.",
    description: "Learn to identify and mitigate AI and LLM security risks, including prompt injection, data leakage and insecure AI pipelines. Master adversarial machine learning defense, model guardrails, and AI red teaming.",
    thumbnail: "/images/gen.png",
    level: "Intermediate to Advanced",
    bannerClass: "ai-sec-bg",
    bannerIcon: "fa-solid fa-brain-circuit",
    idealFor: "Security or software learners interested in securing AI-powered products.",
    learningOutcomes: [
      "Threat-model an LLM application using OWASP LLM Top 10.",
      "Test AI systems for prompt injection and data leakage.",
      "Design guardrails and monitoring for AI pipelines."
    ],
    curriculum: [
      "AI, ML and LLM Fundamentals for Security",
      "Prompt Injection, Jailbreaks and Data Leakage",
      "OWASP Top 10 for LLM Applications",
      "Adversarial Machine Learning and Model Security",
      "Securing AI Pipelines, APIs and Data",
      "AI Red Teaming and Guardrail Design"
    ],
    tools: ["Python", "OWASP LLM Top 10", "MITRE ATLAS", "LLM Red-Team Tools", "Guardrail Frameworks", "Burp Suite"],
    handsOn: "Attacking and then hardening a sample LLM application.",
    roles: ["AI Security Engineer", "AI Red Team Associate", "ML Security Analyst", "Application Security Engineer"],
    tags: ["Secure Engineering", "AI Security", "OWASP LLM", "Prompt Injection", "MITRE ATLAS", "Guardrails"],
    published: true,
    featured: true
  },
  {
    title: "DevSecOps",
    slug: "devsecops",
    track: "Secure Engineering",
    category: "Secure Engineering",
    tagline: "Ship fast without shipping vulnerabilities.",
    shortDescription: "Learn to integrate automated security checks into CI/CD pipelines and secure containers, Kubernetes and infrastructure as code.",
    description: "Learn to integrate automated security checks into CI/CD pipelines and secure containers, Kubernetes and infrastructure as code. Shift security left with automated SAST, DAST, SCA, and compliance as code.",
    thumbnail: "/images/devops.png",
    level: "Intermediate",
    bannerClass: "devops-bg",
    bannerIcon: "fa-solid fa-code-branch",
    idealFor: "Developers, DevOps and cloud learners.",
    learningOutcomes: [
      "Build CI/CD pipelines with automated SAST, DAST and SCA checks.",
      "Harden containers, Kubernetes clusters and IaC templates.",
      "Integrate secrets management and compliance checks."
    ],
    curriculum: [
      "DevOps and CI/CD Fundamentals",
      "Shift-Left Security Mindset",
      "SAST, DAST and SCA in Pipelines",
      "Container and Kubernetes Security",
      "Infrastructure as Code Security",
      "Secrets Management and Compliance as Code"
    ],
    tools: ["Git", "GitHub Actions", "Jenkins", "Docker", "Kubernetes", "SonarQube", "Trivy", "Terraform"],
    handsOn: "Build a secured CI/CD pipeline for a sample application.",
    roles: ["DevSecOps Engineer", "Security Automation Engineer", "Cloud or DevOps Engineer", "Application Security Engineer"],
    tags: ["Secure Engineering", "DevSecOps", "CI/CD", "Docker", "Kubernetes", "SAST", "DAST", "Trivy"],
    published: true,
    featured: true
  },

  // --------------------------------------------------------------------------
  // TRACK 4: AI & AUTOMATION
  // --------------------------------------------------------------------------
  {
    title: "AI Developer",
    slug: "ai-developer",
    track: "AI & Automation",
    category: "AI & Automation",
    tagline: "Build intelligent applications that solve real problems.",
    shortDescription: "Learn Python, machine learning, deep learning, NLP, LLM integration and AI application deployment.",
    description: "Learn Python, machine learning, deep learning, NLP, LLM integration and AI application deployment. Train neural networks, integrate foundation models via APIs, and deploy working AI microservices.",
    thumbnail: "/images/ai.png",
    level: "Beginner to Intermediate",
    bannerClass: "ai-bg",
    bannerIcon: "fa-solid fa-code",
    idealFor: "Students and developers who want to build AI products.",
    learningOutcomes: [
      "Build and evaluate ML and deep learning models in Python.",
      "Integrate LLM APIs and retrieval into applications.",
      "Deploy models as APIs and present a working project."
    ],
    curriculum: [
      "Python for AI",
      "Machine Learning Essentials",
      "Deep Learning and Neural Networks",
      "NLP and LLM Integration",
      "Building AI Apps and APIs",
      "Deployment and Capstone Project"
    ],
    tools: ["Python", "NumPy", "Pandas", "scikit-learn", "PyTorch", "TensorFlow", "Hugging Face", "FastAPI"],
    handsOn: "Mini-projects in every module and a deployed capstone application.",
    roles: ["AI Developer", "Junior ML Engineer", "Python Developer (AI)", "Data Science Associate"],
    tags: ["AI & Automation", "AI Developer", "Machine Learning", "Deep Learning", "PyTorch", "FastAPI"],
    published: true,
    featured: true
  },
  {
    title: "AI Automation",
    slug: "ai-automation",
    track: "AI & Automation",
    category: "AI & Automation",
    tagline: "Let intelligent workflows do the repetitive work.",
    shortDescription: "Learn to connect applications, data and AI to automate business workflows.",
    description: "Learn to connect applications, data and AI to automate business workflows using n8n, Make, and Zapier. Eliminate manual friction and build resilient intelligent automated pipelines.",
    thumbnail: "/images/science.png",
    level: "Beginner to Intermediate",
    bannerClass: "automation-bg",
    bannerIcon: "fa-solid fa-gears",
    idealFor: "Beginners, business professionals and freelancers. No programming background is required to start.",
    learningOutcomes: [
      "Map business processes and identify automation opportunities.",
      "Build workflows using n8n, Zapier or Make.",
      "Monitor, secure and maintain automations."
    ],
    curriculum: [
      "Automation Thinking and Process Mapping",
      "No-Code and Low-Code Workflow Platforms",
      "APIs, Webhooks and Integrations",
      "AI-Powered Automations with LLMs",
      "Document, Email and Data Automation",
      "Monitoring, Error Handling and Scaling"
    ],
    tools: ["n8n", "Zapier", "Make", "Python", "REST APIs", "Google Workspace", "LLM APIs"],
    handsOn: "Several working automations and a final business-workflow project.",
    roles: ["AI Automation Specialist", "Workflow Automation Engineer", "Business Process Analyst", "Automation Consultant"],
    tags: ["AI & Automation", "Workflow Automation", "n8n", "Make", "Zapier", "No-Code", "RPA"],
    published: true,
    featured: true
  },
  {
    title: "Agentic AI",
    slug: "agentic-ai",
    track: "AI & Automation",
    category: "AI & Automation",
    tagline: "Design AI agents that plan, decide and act.",
    shortDescription: "Learn to build intelligent agents that use tools, memory, retrieval and multi-step workflows.",
    description: "Learn to build intelligent agents that use tools, memory, retrieval and multi-step workflows. Design multi-agent swarms with LangGraph and CrewAI that independently orchestrate complex tasks.",
    thumbnail: "/images/cyber-course-card.png",
    level: "Intermediate",
    bannerClass: "agentic-bg",
    bannerIcon: "fa-solid fa-network-wired",
    idealFor: "Learners with basic programming skills.",
    learningOutcomes: [
      "Design agents that use tools, memory and retrieval.",
      "Orchestrate multi-agent workflows using LangGraph or CrewAI.",
      "Evaluate, safeguard and deploy agent systems."
    ],
    curriculum: [
      "From LLMs to Autonomous Agents",
      "Tool Use and Function Calling",
      "Memory, RAG and Knowledge Retrieval",
      "Multi-Agent Orchestration",
      "Evaluation, Guardrails and Safety",
      "Building and Deploying Agent Systems"
    ],
    tools: ["Python", "LangChain", "LangGraph", "CrewAI", "MCP", "Vector Databases", "LLM APIs"],
    handsOn: "Research, support and workflow agents, plus a deployed multi-agent capstone.",
    roles: ["Agentic AI Developer", "AI Agent Engineer", "LLM Application Developer", "AI Solutions Engineer"],
    tags: ["AI & Automation", "Agentic AI", "LangGraph", "CrewAI", "Autonomous Agents", "RAG", "MCP"],
    published: true,
    featured: true
  },
  {
    title: "Prompt Engineer",
    slug: "prompt-engineer",
    track: "AI & Automation",
    category: "AI & Automation",
    tagline: "Speak AI's language and get precise results.",
    shortDescription: "Learn prompt design, prompt chains, structured outputs and systematic prompt evaluation.",
    description: "Learn prompt design, prompt chains, structured outputs and systematic prompt evaluation. Master few-shot techniques, chain-of-thought engineering, and enterprise LLM steering.",
    thumbnail: "/images/hero.png",
    level: "Beginner to Professional",
    bannerClass: "prompt-bg",
    bannerIcon: "fa-solid fa-wand-magic-sparkles",
    idealFor: "Technical and non-technical learners.",
    learningOutcomes: [
      "Write clear, structured prompts.",
      "Chain prompts and generate structured outputs.",
      "Test, score and improve prompts."
    ],
    curriculum: [
      "How Large Language Models Work",
      "Prompt Design Principles",
      "Few-Shot, Chain-of-Thought and Role Prompting",
      "Structured Outputs and Prompt Chaining",
      "Evaluating and Optimising Prompts",
      "Prompting for Business Use and Prompt Security"
    ],
    tools: ["ChatGPT", "Claude", "Gemini", "LLM APIs", "Prompt Libraries", "Evaluation Sheets"],
    handsOn: "Design and test a prompt library for a chosen business function.",
    roles: ["Prompt Engineer", "AI Content Specialist", "Conversational AI Designer", "AI Operations Associate"],
    tags: ["AI & Automation", "Prompt Engineering", "LLM", "Few-Shot", "GenAI", "Evaluation"],
    published: true,
    featured: true
  }
];

module.exports = coursesSeedData;
