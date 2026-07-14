const express = require('express');
const router = express.Router();
const { getCertificateByCourseId, verifyCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

router.get('/courses/:courseId', protect, getCertificateByCourseId);
router.get('/verify/:certificateNumber', verifyCertificate);

module.exports = router;
