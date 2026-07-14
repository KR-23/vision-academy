const db = require('../config/db');

// List courses with search, category, difficulty, price type filters and sort order
async function getCourses(req, res, next) {
  try {
    const { category, difficulty, priceType, search, sort } = req.query;

    let sql = `
      SELECT c.*, u.name as instructor_name,
             COALESCE((SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id), 0) as student_count,
             COALESCE((SELECT AVG(score) FROM quiz_scores qs JOIN quizzes q ON qs.quiz_id = q.id JOIN lessons l ON q.lesson_id = l.id WHERE l.course_id = c.id), 4.5) as rating
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE c.approved = TRUE
    `;
    const params = [];
    let idx = 1;

    if (category) {
      sql += ` AND c.category = $${idx++}`;
      params.push(category);
    }

    if (difficulty) {
      sql += ` AND c.difficulty = $${idx++}`;
      params.push(difficulty);
    }

    if (priceType) {
      if (priceType === 'free') {
        sql += ` AND c.price = 0`;
      } else if (priceType === 'paid') {
        sql += ` AND c.price > 0`;
      }
    }

    if (search) {
      sql += ` AND (c.title LIKE $${idx} OR c.description LIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    // Sorting logic
    if (sort === 'newest') {
      sql += ` ORDER BY c.created_at DESC`;
    } else if (sort === 'price_low') {
      sql += ` ORDER BY c.price ASC`;
    } else if (sort === 'price_high') {
      sql += ` ORDER BY c.price DESC`;
    } else if (sort === 'popular') {
      sql += ` ORDER BY student_count DESC`;
    } else {
      // Default: popular / highest rating
      sql += ` ORDER BY c.id DESC`;
    }

    const { rows } = await db.query(sql, params);
    return res.status(200).json({ courses: rows });
  } catch (error) {
    next(error);
  }
}

// Fetch a single course by ID, including its lessons and enrollment status for the current user
async function getCourseById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Optional authentication depending on route

    // Fetch course details
    const courseSql = `
      SELECT c.*, u.name as instructor_name, u.avatar as instructor_avatar,
             COALESCE((SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id), 0) as student_count
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE c.id = $1
    `;
    const { rows: courseRows } = await db.query(courseSql, [id]);

    if (courseRows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const course = courseRows[0];

    // Fetch lessons for curriculum
    const { rows: lessons } = await db.query(
      'SELECT id, title, description, duration, video_url, sort_order FROM lessons WHERE course_id = $1 ORDER BY sort_order ASC, id ASC',
      [id]
    );

    // Check enrollment status and progress if logged in
    let enrollment = null;
    let completedLessons = [];
    let isWishlisted = false;

    if (userId) {
      const { rows: enrollRows } = await db.query(
        'SELECT progress, completed FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [userId, id]
      );
      if (enrollRows.length > 0) {
        enrollment = enrollRows[0];

        // Fetch completed lesson IDs
        const { rows: compRows } = await db.query(
          `SELECT lesson_id FROM lesson_progress lp
           JOIN lessons l ON lp.lesson_id = l.id
           WHERE lp.user_id = $1 AND l.course_id = $2`,
          [userId, id]
        );
        completedLessons = compRows.map(row => row.lesson_id);
      }

      // Check wishlist
      const { rows: wishRows } = await db.query(
        'SELECT id FROM wishlist WHERE user_id = $1 AND course_id = $2',
        [userId, id]
      );
      isWishlisted = wishRows.length > 0;
    }

    return res.status(200).json({
      course,
      lessons,
      enrolled: !!enrollment,
      progress: enrollment ? enrollment.progress : 0,
      completed: enrollment ? enrollment.completed : false,
      completedLessons,
      isWishlisted
    });
  } catch (error) {
    next(error);
  }
}

// Create a course (Instructor/Admin)
async function createCourse(req, res, next) {
  try {
    const { title, description, category, price, duration, difficulty, language } = req.body;
    const instructorId = req.user.id;

    let thumbnail = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
    if (req.file) {
      thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    }

    const { rows } = await db.query(
      `INSERT INTO courses (title, description, category, instructor_id, thumbnail, price, duration, difficulty, language)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        title,
        description,
        category,
        instructorId,
        thumbnail,
        parseFloat(price || 0),
        duration || '0 hours',
        difficulty || 'Beginner',
        language || 'English'
      ]
    );

    return res.status(201).json({
      course: rows[0],
      message: 'Course created successfully!'
    });
  } catch (error) {
    next(error);
  }
}

// Update a course (Instructor/Admin)
async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, category, price, duration, difficulty, language } = req.body;
    const userId = req.user.id;

    // Check ownership
    const { rows: courseRows } = await db.query('SELECT instructor_id FROM courses WHERE id = $1', [id]);
    if (courseRows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (courseRows[0].instructor_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to update this course' });
    }

    let updateFields = [];
    let params = [];
    let idx = 1;

    if (title) { updateFields.push(`title = $${idx++}`); params.push(title); }
    if (description) { updateFields.push(`description = $${idx++}`); params.push(description); }
    if (category) { updateFields.push(`category = $${idx++}`); params.push(category); }
    if (price !== undefined) { updateFields.push(`price = $${idx++}`); params.push(parseFloat(price)); }
    if (duration) { updateFields.push(`duration = $${idx++}`); params.push(duration); }
    if (difficulty) { updateFields.push(`difficulty = $${idx++}`); params.push(difficulty); }
    if (language) { updateFields.push(`language = $${idx++}`); params.push(language); }

    if (req.file) {
      updateFields.push(`thumbnail = $${idx++}`);
      params.push(`/uploads/thumbnails/${req.file.filename}`);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    params.push(id);
    const queryStr = `UPDATE courses SET ${updateFields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const { rows } = await db.query(queryStr, params);

    return res.status(200).json({
      course: rows[0],
      message: 'Course updated successfully!'
    });
  } catch (error) {
    next(error);
  }
}

// Delete a course (Instructor/Admin)
async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check ownership
    const { rows } = await db.query('SELECT instructor_id FROM courses WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (rows[0].instructor_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to delete this course' });
    }

    await db.query('DELETE FROM courses WHERE id = $1', [id]);
    return res.status(200).json({ message: 'Course deleted successfully!' });
  } catch (error) {
    next(error);
  }
}

// Enroll in a course
async function enrollInCourse(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if already enrolled
    const { rows: existing } = await db.query('SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2', [userId, id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    await db.query('INSERT INTO enrollments (user_id, course_id, progress, completed) VALUES ($1, $2, $3, $4)', [userId, id, 0, false]);
    return res.status(200).json({ message: 'Successfully enrolled in course!' });
  } catch (error) {
    next(error);
  }
}

// Create a lesson for a course
async function createLesson(req, res, next) {
  try {
    const { courseId, title, description, duration, sortOrder, videoUrl } = req.body;
    const userId = req.user.id;

    // Check course ownership
    const { rows: courseRows } = await db.query('SELECT instructor_id FROM courses WHERE id = $1', [courseId]);
    if (courseRows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (courseRows[0].instructor_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to add lessons to this course' });
    }

    let finalVideoUrl = videoUrl || '';
    if (req.file) {
      finalVideoUrl = `/uploads/videos/${req.file.filename}`;
    }

    const { rows } = await db.query(
      `INSERT INTO lessons (course_id, title, description, video_url, duration, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [courseId, title, description, finalVideoUrl, duration || '10 mins', parseInt(sortOrder || 0)]
    );

    return res.status(201).json({
      lesson: rows[0],
      message: 'Lesson added successfully!'
    });
  } catch (error) {
    next(error);
  }
}

// Complete lesson and update user progress / XP
async function updateLessonProgress(req, res, next) {
  try {
    const { lessonId, completed } = req.body; // completed: boolean
    const userId = req.user.id;

    // Get course id of the lesson
    const { rows: lessonRows } = await db.query('SELECT course_id FROM lessons WHERE id = $1', [lessonId]);
    if (lessonRows.length === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    const courseId = lessonRows[0].course_id;

    // Check if enrolled
    const { rows: enrollRows } = await db.query('SELECT id, progress, completed FROM enrollments WHERE user_id = $1 AND course_id = $2', [userId, courseId]);
    if (enrollRows.length === 0) {
      return res.status(400).json({ message: 'You are not enrolled in this course' });
    }

    if (completed) {
      // Add completion entry
      await db.query(
        'INSERT INTO lesson_progress (user_id, lesson_id, completed) VALUES ($1, $2, $3) ON CONFLICT(user_id, lesson_id) DO NOTHING',
        [userId, lessonId, true]
      );

      // Award XP Points for finishing lesson (+50 XP)
      await db.query('UPDATE users SET xp = xp + 50 WHERE id = $1', [userId]);
    } else {
      // Remove completion entry
      await db.query('DELETE FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2', [userId, lessonId]);
    }

    // Calculate new overall progress
    const { rows: lessonsCountRows } = await db.query('SELECT count(*) as count FROM lessons WHERE course_id = $1', [courseId]);
    const totalLessons = parseInt(lessonsCountRows[0].count || 0);

    let progressPercentage = 0;
    if (totalLessons > 0) {
      const { rows: completedRows } = await db.query(
        `SELECT COUNT(*) as count FROM lesson_progress lp
         JOIN lessons l ON lp.lesson_id = l.id
         WHERE lp.user_id = $1 AND l.course_id = $2`,
        [userId, courseId]
      );
      const completedCount = parseInt(completedRows[0].count || 0);
      progressPercentage = Math.round((completedCount / totalLessons) * 100);
    }

    const courseCompleted = progressPercentage === 100;
    await db.query(
      'UPDATE enrollments SET progress = $1, completed = $2 WHERE user_id = $3 AND course_id = $4',
      [progressPercentage, courseCompleted, userId, courseId]
    );

    return res.status(200).json({
      progress: progressPercentage,
      completed: courseCompleted,
      xpAwarded: completed ? 50 : 0,
      message: courseCompleted 
        ? 'Congratulations! You have completed the entire course!' 
        : 'Lesson progress updated successfully!'
    });
  } catch (error) {
    next(error);
  }
}

// Toggle Wishlist
async function toggleWishlist(req, res, next) {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Check if in wishlist
    const { rows } = await db.query('SELECT id FROM wishlist WHERE user_id = $1 AND course_id = $2', [userId, courseId]);

    if (rows.length > 0) {
      await db.query('DELETE FROM wishlist WHERE user_id = $1 AND course_id = $2', [userId, courseId]);
      return res.status(200).json({ isWishlisted: false, message: 'Removed from wishlist' });
    } else {
      await db.query('INSERT INTO wishlist (user_id, course_id) VALUES ($1, $2)', [userId, courseId]);
      return res.status(200).json({ isWishlisted: true, message: 'Added to wishlist' });
    }
  } catch (error) {
    next(error);
  }
}

// Fetch Wishlisted Courses
async function getWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const { rows } = await db.query(
      `SELECT c.*, u.name as instructor_name FROM wishlist w
       JOIN courses c ON w.course_id = c.id
       JOIN users u ON c.instructor_id = u.id
       WHERE w.user_id = $1`,
      [userId]
    );
    return res.status(200).json({ wishlist: rows });
  } catch (error) {
    next(error);
  }
}

// Toggle Bookmark / Notes for a Lesson
async function toggleBookmark(req, res, next) {
  try {
    const { lessonId, note, timestamp } = req.body;
    const userId = req.user.id;

    const { rows } = await db.query(
      `INSERT INTO bookmarks (user_id, lesson_id, note, timestamp)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, lessonId, note || '', timestamp || 0]
    );

    return res.status(201).json({
      bookmark: rows[0],
      message: 'Note and bookmark saved successfully!'
    });
  } catch (error) {
    next(error);
  }
}

// Get Bookmarks for a Lesson
async function getBookmarks(req, res, next) {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const { rows } = await db.query(
      'SELECT id, note, timestamp, created_at FROM bookmarks WHERE user_id = $1 AND lesson_id = $2 ORDER BY timestamp ASC',
      [userId, lessonId]
    );

    return res.status(200).json({ bookmarks: rows });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  createLesson,
  updateLessonProgress,
  toggleWishlist,
  getWishlist,
  toggleBookmark,
  getBookmarks
};
