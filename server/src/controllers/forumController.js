const db = require('../config/db');

// Fetch discussions for a course
async function getDiscussionsByCourseId(req, res, next) {
  try {
    const { courseId } = req.params;

    const { rows } = await db.query(
      `SELECT d.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role,
             (SELECT COUNT(*) FROM replies r WHERE r.discussion_id = d.id) as reply_count
       FROM discussions d
       JOIN users u ON d.user_id = u.id
       WHERE d.course_id = $1
       ORDER BY d.pinned DESC, d.created_at DESC`,
      [courseId]
    );

    return res.status(200).json({ discussions: rows });
  } catch (error) {
    next(error);
  }
}

// Create a new discussion thread
async function createDiscussion(req, res, next) {
  try {
    const { courseId, title, content } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const { rows } = await db.query(
      `INSERT INTO discussions (course_id, user_id, title, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [courseId, userId, title, content]
    );

    // Fetch new post with user metadata
    const { rows: postRows } = await db.query(
      `SELECT d.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role, 0 as reply_count
       FROM discussions d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = $1`,
      [rows[0].id]
    );

    return res.status(201).json({
      discussion: postRows[0],
      message: 'Discussion topic posted!'
    });
  } catch (error) {
    next(error);
  }
}

// Fetch replies for a discussion thread
async function getRepliesByDiscussionId(req, res, next) {
  try {
    const { discussionId } = req.params;

    const { rows } = await db.query(
      `SELECT r.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role
       FROM replies r
       JOIN users u ON r.user_id = u.id
       WHERE r.discussion_id = $1
       ORDER BY r.is_instructor_answer DESC, r.created_at ASC`,
      [discussionId]
    );

    return res.status(200).json({ replies: rows });
  } catch (error) {
    next(error);
  }
}

// Reply to a discussion thread
async function createReply(req, res, next) {
  try {
    const { discussionId, content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Check if the replying user is the instructor of the course
    const courseSql = `
      SELECT c.instructor_id 
      FROM discussions d
      JOIN courses c ON d.course_id = c.id
      WHERE d.id = $1
    `;
    const { rows: courseRows } = await db.query(courseSql, [discussionId]);
    
    if (courseRows.length === 0) {
      return res.status(404).json({ message: 'Discussion thread not found' });
    }

    const isInstructor = courseRows[0].instructor_id === userId;

    const { rows } = await db.query(
      `INSERT INTO replies (discussion_id, user_id, content, is_instructor_answer)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [discussionId, userId, content, isInstructor]
    );

    // Fetch details with user profile
    const { rows: replyRows } = await db.query(
      `SELECT r.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role
       FROM replies r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [rows[0].id]
    );

    return res.status(201).json({
      reply: replyRows[0],
      message: 'Reply posted!'
    });
  } catch (error) {
    next(error);
  }
}

// Like/Unlike a discussion thread
async function toggleLikeDiscussion(req, res, next) {
  try {
    const { id } = req.params;

    // Toggle increment like (simplified without separate table for liked entries for lightness)
    const { rows } = await db.query(
      'UPDATE discussions SET likes = likes + 1 WHERE id = $1 RETURNING likes',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Discussion thread not found' });
    }

    return res.status(200).json({ likes: rows[0].likes });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDiscussionsByCourseId,
  createDiscussion,
  getRepliesByDiscussionId,
  createReply,
  toggleLikeDiscussion
};
