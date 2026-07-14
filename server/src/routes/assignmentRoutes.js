const express = require('express');
const router = express.Router();
const {
  getAssignmentsByCourseId,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getSubmissionsByAssignment
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/courses/:courseId', protect, getAssignmentsByCourseId);
router.post('/submit', protect, upload.single('file'), submitAssignment);

// Instructor routes
router.post('/create', protect, authorize('instructor', 'admin'), createAssignment);
router.put('/submissions/:id/grade', protect, authorize('instructor', 'admin'), gradeSubmission);
router.get('/submissions/:assignmentId', protect, authorize('instructor', 'admin'), getSubmissionsByAssignment);

module.exports = router;
