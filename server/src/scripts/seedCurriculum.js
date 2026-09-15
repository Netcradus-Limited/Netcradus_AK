const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const slugify = require('slugify');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');

const curriculumSeedData = [
  {
    courseSlug: 'cyber',
    modules: [
      {
        title: 'Module 1 — Information Gathering & Reconnaissance',
        description: 'Learn ethical hacking fundamentals, passive and active footprinting techniques.',
        order: 1,
        published: true,
        lectures: [
          {
            title: '1.1 Introduction to Ethical Hacking & Security Mindset',
            type: 'video',
            durationSeconds: 900,
            order: 1,
            preview: true, // FREE PREVIEW
            published: true,
            video: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: 'Overview of cybersecurity career pathways, threat landscapes, and security compliance.',
            resources: [
              { title: 'Ethical Hacking Starter Roadmap (PDF)', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
            ],
          },
          {
            title: '1.2 OSINT & Passive Footprinting Techniques',
            type: 'video',
            durationSeconds: 1200,
            order: 2,
            preview: true, // FREE PREVIEW
            published: true,
            video: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: 'Using Shodan, Maltego, Google Dorks, and WHOIS for intelligence gathering.',
            resources: [
              { title: 'Google Dorking Cheat Sheet', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
            ],
          },
          {
            title: '1.3 Active Reconnaissance & Nmap Port Scanning',
            type: 'lab_video',
            durationSeconds: 1500,
            order: 3,
            preview: false, // LOCKED
            published: true,
            video: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: 'Hands-on practical execution of TCP SYN, UDP, and service version detection scans.',
            resources: [
              { title: 'Nmap Command Reference Guide', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
            ],
          },
        ],
      },
      {
        title: 'Module 2 — Lab Setup & Virtualization Environments',
        description: 'Build your isolated penetration testing laboratory with VirtualBox and Kali Linux.',
        order: 2,
        published: true,
        lectures: [
          {
            title: '2.1 Installing & Configuring VirtualBox Sandbox',
            type: 'lab_video',
            durationSeconds: 1050,
            order: 1,
            preview: false, // LOCKED
            published: true,
            video: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: 'Step-by-step installation of VirtualBox and host-only network configuration.',
            resources: [
              { title: 'VirtualBox Setup Guide (PDF)', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
            ],
          },
          {
            title: '2.2 Deploying Kali Linux 2026 & Security Toolkits',
            type: 'lab_video',
            durationSeconds: 1400,
            order: 2,
            preview: false, // LOCKED
            published: true,
            video: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: 'Deploying Kali ISO, configuring root privileges, and updating package repositories.',
            resources: [
              { title: 'Kali Linux Tool List & Shortcuts', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
            ],
          },
          {
            title: '2.3 Metasploitable & Target Machine Deployment',
            type: 'text',
            durationSeconds: 600,
            order: 3,
            preview: false, // LOCKED
            published: true,
            content: '### Metasploitable 2 Setup Instructions\n\n1. Download Metasploitable 2 zip file.\n2. Extract VDK file to VirtualBox directory.\n3. Attach to Host-Only adapter with IP `192.168.56.101`.\n4. Verify ping connectivity from Kali Linux.',
            resources: [],
          },
        ],
      },
    ],
  },
  {
    courseSlug: 'ai',
    modules: [
      {
        title: 'Module 1 — Foundations of AI & Machine Learning',
        description: 'Explore core ML paradigms, supervised and unsupervised learning algorithms.',
        order: 1,
        published: true,
        lectures: [
          {
            title: '1.1 Welcome to Generative AI & LLMs',
            type: 'video',
            durationSeconds: 850,
            order: 1,
            preview: true, // FREE PREVIEW
            published: true,
            video: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: 'Introduction to Transformers, Attention Mechanisms, and modern GenAI stack.',
            resources: [
              { title: 'Generative AI Architecture Overview', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
            ],
          },
          {
            title: '1.2 Building Neural Networks from Scratch with PyTorch',
            type: 'lab_video',
            durationSeconds: 1800,
            order: 2,
            preview: false, // LOCKED
            published: true,
            video: 'https://www.w3schools.com/html/mov_bbb.mp4',
            description: 'Hands-on coding tutorial: Tensors, AutoGrad, Linear layers, and loss functions.',
            resources: [
              { title: 'PyTorch Cheat Sheet Notebook', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
            ],
          },
        ],
      },
    ],
  },
];


const seedCurriculum = async () => {
  try {
    console.log('[SeedCurriculum] Initializing database connection...');
    await connectDB();

    for (const item of curriculumSeedData) {
      const course = await Course.findOne({ slug: item.courseSlug });
      if (!course) {
        console.warn(`[SeedCurriculum] Course '${item.courseSlug}' not found. Skipping...`);
        continue;
      }

      console.log(`[SeedCurriculum] Processing curriculum for course: ${course.title}`);

      for (const modData of item.modules) {
        let moduleDoc = await Module.findOne({ courseId: course._id, order: modData.order });
        if (!moduleDoc) {
          moduleDoc = await Module.create({
            courseId: course._id,
            title: modData.title,
            description: modData.description,
            order: modData.order,
            published: modData.published,
          });
          console.log(`  + Created Module: ${moduleDoc.title}`);
        } else {
          moduleDoc.title = modData.title;
          moduleDoc.description = modData.description;
          await moduleDoc.save();
          console.log(`  ~ Updated Module: ${moduleDoc.title}`);
        }

        for (const lecData of modData.lectures) {
          const generatedSlug = slugify(lecData.title, { lower: true, strict: true });
          let lessonDoc = await Lesson.findOne({ moduleId: moduleDoc._id, order: lecData.order });
          if (!lessonDoc) {
            lessonDoc = await Lesson.create({
              courseId: course._id,
              moduleId: moduleDoc._id,
              title: lecData.title,
              slug: generatedSlug,
              type: lecData.type,
              durationSeconds: lecData.durationSeconds,
              order: lecData.order,
              preview: lecData.preview,
              published: lecData.published,
              video: lecData.video || '',
              content: lecData.content || '',
              description: lecData.description || '',
              resources: lecData.resources || [],
            });
            console.log(`    + Created Lecture: ${lessonDoc.title} (Preview: ${lessonDoc.preview})`);
          } else {
            lessonDoc.title = lecData.title;
            lessonDoc.type = lecData.type;
            lessonDoc.preview = lecData.preview;
            lessonDoc.video = lecData.video || '';
            lessonDoc.content = lecData.content || '';
            lessonDoc.description = lecData.description || '';
            lessonDoc.resources = lecData.resources || [];
            await lessonDoc.save();
            console.log(`    ~ Updated Lecture: ${lessonDoc.title}`);
          }
        }
      }
    }

    console.log('[SeedCurriculum] Curriculum seeding completed successfully!');
  } catch (err) {
    console.error('[SeedCurriculum Error]:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedCurriculum();
