const db = require('../config/db');

// Retrieve or generate a certificate upon course completion
async function getCertificateByCourseId(req, res, next) {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check enrollment and progress
    const { rows: enrollRows } = await db.query(
      'SELECT progress, completed FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (enrollRows.length === 0) {
      return res.status(404).json({ message: 'You are not enrolled in this course.' });
    }

    const enrollment = enrollRows[0];
    if (enrollment.progress < 100) {
      return res.status(400).json({
        message: 'Course not completed. You must reach 100% progress before generating a certificate.',
        currentProgress: enrollment.progress
      });
    }

    // Check if certificate already exists
    const { rows: certRows } = await db.query(
      `SELECT c.certificate_number, c.issued_at, u.name as student_name, co.title as course_name, inst.name as instructor_name
       FROM certificates c
       JOIN users u ON c.user_id = u.id
       JOIN courses co ON c.course_id = co.id
       JOIN users inst ON co.instructor_id = inst.id
       WHERE c.user_id = $1 AND c.course_id = $2`,
      [userId, courseId]
    );

    if (certRows.length > 0) {
      return res.status(200).json({ certificate: certRows[0] });
    }

    // Generate unique certificate ID
    const uniqueId = 'LMS-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Insert new certificate
    await db.query(
      'INSERT INTO certificates (user_id, course_id, certificate_number) VALUES ($1, $2, $3)',
      [userId, courseId, uniqueId]
    );

    // Fetch full certificate details
    const { rows: newCertRows } = await db.query(
      `SELECT c.certificate_number, c.issued_at, u.name as student_name, co.title as course_name, inst.name as instructor_name
       FROM certificates c
       JOIN users u ON c.user_id = u.id
       JOIN courses co ON c.course_id = co.id
       JOIN users inst ON co.instructor_id = inst.id
       WHERE c.certificate_number = $1`,
      [uniqueId]
    );

    return res.status(201).json({
      certificate: newCertRows[0],
      message: 'Certificate issued successfully!'
    });
  } catch (error) {
    next(error);
  }
}

// Verify a certificate publicly
async function verifyCertificate(req, res, next) {
  try {
    const { certificateNumber } = req.params;

    const { rows } = await db.query(
      `SELECT c.certificate_number, c.issued_at, u.name as student_name, co.title as course_name, inst.name as instructor_name
       FROM certificates c
       JOIN users u ON c.user_id = u.id
       JOIN courses co ON c.course_id = co.id
       JOIN users inst ON co.instructor_id = inst.id
       WHERE c.certificate_number = $1`,
      [certificateNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({ verified: false, message: 'Invalid certificate ID. Verification failed.' });
    }

    return res.status(200).json({
      verified: true,
      certificate: rows[0],
      message: 'Certificate successfully verified!'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCertificateByCourseId,
  verifyCertificate
};
