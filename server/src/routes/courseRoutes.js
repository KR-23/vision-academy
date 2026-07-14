const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/courseController');
const { protect, optionalProtect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public and Guest-optional routes
router.get('/', getCourses);
router.get('/:id', optionalProtect, getCourseById);

// Student protected routes
router.get('/student/wishlist', protect, getWishlist);
router.post('/student/wishlist', protect, toggleWishlist);
router.post('/:id/enroll', protect, enrollInCourse);
router.post('/lessons/progress', protect, updateLessonProgress);
router.post('/lessons/bookmark', protect, toggleBookmark);
router.get('/lessons/:lessonId/bookmarks', protect, getBookmarks);

// Instructor / Admin protected routes
router.post('/', protect, authorize('instructor', 'admin'), upload.single('thumbnail'), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), upload.single('thumbnail'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);
router.post('/lessons/create', protect, authorize('instructor', 'admin'), upload.single('video'), createLesson);

module.exports = router;
