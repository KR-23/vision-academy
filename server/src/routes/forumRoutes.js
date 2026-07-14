const express = require('express');
const router = express.Router();
const {
  getDiscussionsByCourseId,
  createDiscussion,
  getRepliesByDiscussionId,
  createReply,
  toggleLikeDiscussion
} = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');

router.get('/courses/:courseId', protect, getDiscussionsByCourseId);
router.post('/create', protect, createDiscussion);
router.get('/discussions/:discussionId/replies', protect, getRepliesByDiscussionId);
router.post('/reply', protect, createReply);
router.put('/discussions/:id/like', protect, toggleLikeDiscussion);

module.exports = router;
