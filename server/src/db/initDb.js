const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seedData() {
  try {
    // Check if users already exist
    const { rows: existingUsers } = await db.query('SELECT count(*) as count FROM users');
    const userCount = parseInt(existingUsers[0].count || 0);

    if (userCount > 0) {
      console.log('Database already contains data. Skipping seeding.');
      return;
    }

    console.log('Seeding initial data...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const instructorPassword = await bcrypt.hash('Instructor123!', 10);
    const studentPassword = await bcrypt.hash('Student123!', 10);

    // Insert Users
    // We run individual INSERTs to be compatible with both PostgreSQL & SQLite RETURNING syntax
    const adminRes = await db.query(
      `INSERT INTO users (name, email, password, role, avatar, instructor_approved, xp, streak) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      ['Alex Admin', 'admin@lms.com', adminPassword, 'admin', 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin', true, 100, 5]
    );
    const adminId = adminRes.rows[0].id;

    const instructorRes = await db.query(
      `INSERT INTO users (name, email, password, role, avatar, instructor_approved, xp, streak) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      ['Sarah Instructor', 'instructor@lms.com', instructorPassword, 'instructor', 'https://api.dicebear.com/7.x/adventurer/svg?seed=sarah', true, 500, 12]
    );
    const instructorId = instructorRes.rows[0].id;

    const studentRes = await db.query(
      `INSERT INTO users (name, email, password, role, avatar, instructor_approved, xp, streak) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      ['John Student', 'student@lms.com', studentPassword, 'student', 'https://api.dicebear.com/7.x/adventurer/svg?seed=john', false, 1500, 4]
    );
    const studentId = studentRes.rows[0].id;

    // Create Courses
    const c1 = await db.query(
      `INSERT INTO courses (title, description, category, instructor_id, thumbnail, price, duration, difficulty, language)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        'Modern React & Node.js: The Full-Stack Blueprint',
        'Master React, Node.js, Express, and databases. Build clean, production-ready web apps with premium user interfaces, dark modes, glassmorphism, and responsive layouts.',
        'Programming',
        instructorId,
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
        99.99,
        '24 hours',
        'Intermediate',
        'English'
      ]
    );
    const course1Id = c1.rows[0].id;

    const c2 = await db.query(
      `INSERT INTO courses (title, description, category, instructor_id, thumbnail, price, duration, difficulty, language)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        'Intro to AI & Neural Networks',
        'Understand machine learning fundamentals, build neural networks from scratch, and explore modern generative AI structures, LLMs, and transformers.',
        'AI',
        instructorId,
        '/ai_thumbnail.png',
        149.99,
        '18 hours',
        'Advanced',
        'English'
      ]
    );
    const course2Id = c2.rows[0].id;

    const c3 = await db.query(
      `INSERT INTO courses (title, description, category, instructor_id, thumbnail, price, duration, difficulty, language)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        'UI/UX Design Masterclass: Coursera to Linear',
        'Learn the secrets of modern digital interfaces. Discover how to use typography, whitespace, and Framer Motion to craft high-fidelity designs.',
        'Design',
        instructorId,
        '/design_thumbnail.png',
        0.00,
        '8 hours',
        'Beginner',
        'English'
      ]
    );
    const course3Id = c3.rows[0].id;

    // Add Lessons for Course 1
    const l1 = await db.query(
      `INSERT INTO lessons (course_id, title, description, video_url, duration, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        course1Id,
        'Course Overview & Architecture Design',
        'Learn about what we will build, how Express maps routing, and how databases fit into our application layout.',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        '12 mins',
        1
      ]
    );
    const lesson1Id = l1.rows[0].id;

    const l2 = await db.query(
      `INSERT INTO lessons (course_id, title, description, video_url, duration, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        course1Id,
        'Configuring Express & PostgreSQL Connectivity',
        'Deep dive into connecting your app to Postgres with local fallback code support using SQLite databases.',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        '25 mins',
        2
      ]
    );
    const lesson2Id = l2.rows[0].id;

    const l3 = await db.query(
      `INSERT INTO lessons (course_id, title, description, video_url, duration, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        course1Id,
        'React Router & Framer Motion Page Transitions',
        'Connect navigation routes and hook them up with beautiful, responsive micro-animations using Framer Motion.',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        '18 mins',
        3
      ]
    );
    const lesson3Id = l3.rows[0].id;

    // Add Quiz for Lesson 1
    const q1 = await db.query(
      `INSERT INTO quizzes (lesson_id, title) VALUES ($1, $2) RETURNING id`,
      [lesson1Id, 'Express Architecture Basics Quiz']
    );
    const quiz1Id = q1.rows[0].id;

    // Add Questions for Quiz 1
    // Store options array as JSON string for compatibility
    const qOptions1 = JSON.stringify(['Model View Controller (MVC)', 'Linear Class Notation (LCN)', 'Node Client View (NCV)', 'Database Route Mapping (DRM)']);
    const qOptions2 = JSON.stringify(['POST', 'GET', 'PUT', 'DELETE']);

    await db.query(
      `INSERT INTO questions (quiz_id, question, options, correct_answer) VALUES ($1, $2, $3, $4)`,
      [quiz1Id, 'Which architectural pattern is commonly used in Express servers?', qOptions1, 'Model View Controller (MVC)']
    );
    await db.query(
      `INSERT INTO questions (quiz_id, question, options, correct_answer) VALUES ($1, $2, $3, $4)`,
      [quiz1Id, 'Which HTTP method should be used for user login registration submissions?', qOptions2, 'POST']
    );

    // Add Assignment for Course 1
    await db.query(
      `INSERT INTO assignments (course_id, title, description, due_date, file_url)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        course1Id,
        'Project Assignment 1: Build a Node API',
        'Create a RESTful API with endpoints for registering and logging in users. Submit a link to your Git repository or upload your JavaScript project file.',
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        'https://pdfobject.com/pdf/sample.pdf'
      ]
    );

    // Add Discussions for Course 1
    const d1 = await db.query(
      `INSERT INTO discussions (course_id, user_id, title, content, pinned, likes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        course1Id,
        studentId,
        'How to setup local sqlite fallbacks?',
        'Hi everyone, I am trying to run the app offline and want to confirm if SQLite fallback handles PG syntax like SERIAL PRIMARY KEY. Does it work automatically?',
        false,
        5
      ]
    );
    const discussionId = d1.rows[0].id;

    // Add Reply to discussion
    await db.query(
      `INSERT INTO replies (discussion_id, user_id, content, is_instructor_answer)
       VALUES ($1, $2, $3, $4)`,
      [
        instructorId,
        'Yes! The database connector has a dynamically parsing translation engine inside initDb.js and db.js that replaces SERIAL with INTEGER AUTOINCREMENT and rewrites binding parameters. It works out-of-the-box!',
        true
      ]
    );

    // Mock Enroll Student in Course 1
    await db.query(
      `INSERT INTO enrollments (user_id, course_id, progress, completed) VALUES ($1, $2, $3, $4)`,
      [studentId, course1Id, 33, false]
    );
    await db.query(
      `INSERT INTO lesson_progress (user_id, lesson_id, completed) VALUES ($1, $2, $3)`,
      [studentId, lesson1Id, true]
    );

    console.log('Initial data seeded successfully.');
  } catch (err) {
    console.error('Error seeding data:', err.message);
  }
}

async function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  let schema = fs.readFileSync(schemaPath, 'utf8');

  console.log('Initializing database tables...');

  if (db.getIsPostgres()) {
    try {
      await db.query(schema);
      console.log('PostgreSQL tables initialized successfully.');
      await seedData();
    } catch (err) {
      console.error('Error initializing PostgreSQL tables:', err.message);
    }
  } else {
    // Translate PG specific definitions to SQLite
    schema = schema
      .replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
      .replace(/JSONB/g, 'TEXT')
      .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
      .replace(/TIMESTAMP/g, 'DATETIME');

    // Split schema file by semicolon to execute tables independently
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        await db.query(stmt + ';');
      } catch (err) {
        console.error('Error running statement in SQLite:', stmt);
        console.error(err.message);
      }
    }
    console.log('SQLite tables initialized successfully.');
    await seedData();
  }
}

module.exports = initDb;
