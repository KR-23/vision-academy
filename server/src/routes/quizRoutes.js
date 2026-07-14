const express = require('express');
const router = express.Router();
const { getQuizByLessonId, createQuiz, submitQuiz } = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/lessons/:lessonId', protect, getQuizByLessonId);
router.post('/submit', protect, submitQuiz);
router.post('/create', protect, authorize('instructor', 'admin'), createQuiz);

module.exports = router;
