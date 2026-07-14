const express = require('express');
const router = express.Router();
const {
  getStudentDashboard,
  getInstructorDashboard,
  getAdminDashboard,
  approveInstructor
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/student', protect, getStudentDashboard);
router.get('/instructor', protect, authorize('instructor', 'admin'), getInstructorDashboard);
router.get('/admin', protect, authorize('admin'), getAdminDashboard);
router.post('/admin/approve-instructor', protect, authorize('admin'), approveInstructor);

module.exports = router;
