const db = require('../config/db');

// Get assignments for a course
async function getAssignmentsByCourseId(req, res, next) {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Fetch assignments
    const { rows: assignments } = await db.query(
      'SELECT id, title, description, due_date, file_url FROM assignments WHERE course_id = $1 ORDER BY due_date ASC',
      [courseId]
    );

    // Fetch user submissions for this course's assignments
    const { rows: submissions } = await db.query(
      `SELECT s.* FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       WHERE a.course_id = $1 AND s.user_id = $2`,
      [courseId, userId]
    );

    // Map submissions onto assignments
    const mapped = assignments.map((a) => {
      const sub = submissions.find((s) => s.assignment_id === a.id);
      return {
        ...a,
        submission: sub ? {
          id: sub.id,
          fileUrl: sub.file_url,
          grade: sub.grade,
          feedback: sub.feedback,
          submittedAt: sub.submitted_at
        } : null
      };
    });

    return res.status(200).json({ assignments: mapped });
  } catch (error) {
    next(error);
  }
}

// Create an assignment (Instructor/Admin)
async function createAssignment(req, res, next) {
  try {
    const { courseId, title, description, dueDate, fileUrl } = req.body;
    const userId = req.user.id;

    // Check course ownership
    const { rows: courseRows } = await db.query('SELECT instructor_id FROM courses WHERE id = $1', [courseId]);
    if (courseRows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (courseRows[0].instructor_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to create assignments' });
    }

    const { rows } = await db.query(
      `INSERT INTO assignments (course_id, title, description, due_date, file_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [courseId, title, description, dueDate, fileUrl || '']
    );

    return res.status(201).json({
      assignment: rows[0],
      message: 'Assignment created successfully!'
    });
  } catch (error) {
    next(error);
  }
}

// Submit assignment file (Student)
async function submitAssignment(req, res, next) {
  try {
    const { assignmentId } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please upload a project file.' });
    }

    const fileUrl = `/uploads/assignments/${req.file.filename}`;

    // Check if submission already exists
    const { rows: existing } = await db.query(
      'SELECT id FROM submissions WHERE assignment_id = $1 AND user_id = $2',
      [assignmentId, userId]
    );

    let submission;
    if (existing.length > 0) {
      // Update
      const { rows } = await db.query(
        'UPDATE submissions SET file_url = $1, submitted_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [fileUrl, existing[0].id]
      );
      submission = rows[0];
    } else {
      // Create new
      const { rows } = await db.query(
        'INSERT INTO submissions (assignment_id, user_id, file_url) VALUES ($1, $2, $3) RETURNING *',
        [assignmentId, userId, fileUrl]
      );
      submission = rows[0];
    }

    return res.status(200).json({
      submission,
      message: 'Assignment submitted successfully!'
    });
  } catch (error) {
    next(error);
  }
}

// Grade and review submission (Instructor/Admin)
async function gradeSubmission(req, res, next) {
  try {
    const { id } = req.params; // Submission ID
    const { grade, feedback } = req.body;
    const instructorId = req.user.id;

    // Verify instructor ownership of the course containing this submission
    const verifySql = `
      SELECT c.instructor_id, s.user_id, s.assignment_id
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE s.id = $1
    `;
    const { rows: verifyRows } = await db.query(verifySql, [id]);

    if (verifyRows.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const { instructor_id, user_id: studentId } = verifyRows[0];

    if (instructor_id !== instructorId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to grade this submission' });
    }

    const { rows } = await db.query(
      'UPDATE submissions SET grade = $1, feedback = $2 WHERE id = $3 RETURNING *',
      [grade, feedback, id]
    );

    // Gamification XP Reward for Student based on Grade
    let xpReward = 100;
    if (['A+', 'A', 'A-'].includes(grade)) {
      xpReward = 300;
    } else if (['B+', 'B', 'B-'].includes(grade)) {
      xpReward = 200;
    }

    await db.query('UPDATE users SET xp = xp + $1 WHERE id = $2', [xpReward, studentId]);

    return res.status(200).json({
      submission: rows[0],
      xpReward,
      message: 'Submission graded successfully! Student awarded ' + xpReward + ' XP.'
    });
  } catch (error) {
    next(error);
  }
}

// Fetch submissions for a specific assignment (Instructor/Admin view)
async function getSubmissionsByAssignment(req, res, next) {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.id;

    // Verify course ownership
    const { rows: courseRows } = await db.query(
      'SELECT c.instructor_id FROM assignments a JOIN courses c ON a.course_id = c.id WHERE a.id = $1',
      [assignmentId]
    );

    if (courseRows.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (courseRows[0].instructor_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to view submissions' });
    }

    const { rows: submissions } = await db.query(
      `SELECT s.*, u.name as student_name, u.email as student_email, u.avatar as student_avatar
       FROM submissions s
       JOIN users u ON s.user_id = u.id
       WHERE s.assignment_id = $1
       ORDER BY s.submitted_at DESC`,
      [assignmentId]
    );

    return res.status(200).json({ submissions });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAssignmentsByCourseId,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getSubmissionsByAssignment
};
