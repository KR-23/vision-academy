const db = require('../config/db');

// Student Dashboard Statistics & Gamification
async function getStudentDashboard(req, res, next) {
  try {
    const userId = req.user.id;

    // Fetch user details
    const { rows: userRows } = await db.query('SELECT xp, streak, last_active_date FROM users WHERE id = $1', [userId]);
    const user = userRows[0];

    // Fetch enrolled courses
    const { rows: enrolled } = await db.query(
      `SELECT e.progress, e.completed, c.id as course_id, c.title, c.category, c.thumbnail, u.name as instructor_name
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON c.instructor_id = u.id
       WHERE e.user_id = $1`,
      [userId]
    );

    const totalEnrolled = enrolled.length;
    const completedCourses = enrolled.filter(c => c.completed).length;

    // Fetch certificates
    const { rows: certs } = await db.query('SELECT id, certificate_number, issued_at FROM certificates WHERE user_id = $1', [userId]);

    // Fetch upcoming assignments
    const { rows: upcomingAssignments } = await db.query(
      `SELECT a.id, a.title, a.due_date, c.title as course_title
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       JOIN enrollments e ON e.course_id = c.id
       LEFT JOIN submissions s ON s.assignment_id = a.id AND s.user_id = $1
       WHERE e.user_id = $1 AND s.id IS NULL AND a.due_date > CURRENT_TIMESTAMP
       ORDER BY a.due_date ASC
       LIMIT 3`,
      [userId]
    );

    // Gamification Badges calculation
    const badges = [];
    if (user.xp >= 100) badges.push({ id: 'novice', name: 'Novice Learner', desc: 'Earned 100+ XP points', icon: 'Sparkles', color: 'from-cyan-500 to-blue-500' });
    if (user.xp >= 500) badges.push({ id: 'scholar', name: 'Active Scholar', desc: 'Earned 500+ XP points', icon: 'GraduationCap', color: 'from-indigo-500 to-purple-500' });
    if (user.xp >= 1500) badges.push({ id: 'master', name: 'LMS Guru', desc: 'Earned 1500+ XP points', icon: 'Crown', color: 'from-amber-500 to-orange-500' });
    if (user.streak >= 5) badges.push({ id: 'streak_legend', name: 'Streak Legend', desc: 'Maintained a 5+ day streak', icon: 'Flame', color: 'from-red-500 to-rose-500' });

    // Recent activity (mocked from quiz scores and lesson completions)
    const { rows: quizScores } = await db.query(
      `SELECT qs.score, qs.total_questions, qs.created_at, q.title as quiz_title
       FROM quiz_scores qs
       JOIN quizzes q ON qs.quiz_id = q.id
       WHERE qs.user_id = $1
       ORDER BY qs.created_at DESC
       LIMIT 3`,
      [userId]
    );

    const activities = quizScores.map(score => ({
      type: 'quiz',
      title: `Scored ${score.score}/${score.total_questions} on ${score.quiz_title}`,
      date: score.created_at
    }));

    return res.status(200).json({
      xp: user.xp,
      streak: user.streak,
      totalEnrolled,
      completedCourses,
      badges,
      enrolledCourses: enrolled,
      certificates: certs,
      upcomingAssignments,
      recentActivity: activities,
      dailyGoal: 100, // Target XP per day
      dailyGoalProgress: Math.min(Math.round((user.xp % 100)), 100)
    });
  } catch (error) {
    next(error);
  }
}

// Instructor Dashboard & Revenue Statistics
async function getInstructorDashboard(req, res, next) {
  try {
    const instructorId = req.user.id;

    // Fetch instructor courses
    const { rows: courses } = await db.query(
      `SELECT c.id, c.title, c.price, c.category, c.thumbnail,
              (SELECT count(*) FROM enrollments e WHERE e.course_id = c.id) as student_count
       FROM courses c
       WHERE c.instructor_id = $1`,
      [instructorId]
    );

    const totalCourses = courses.length;
    const totalStudents = courses.reduce((acc, curr) => acc + parseInt(curr.student_count), 0);
    const totalRevenue = courses.reduce((acc, curr) => acc + (parseFloat(curr.price) * parseInt(curr.student_count)), 0);

    // Fetch student analytics (grouped list)
    const { rows: studentList } = await db.query(
      `SELECT u.name, u.email, u.avatar, c.title as course_title, e.progress, e.created_at as enrolled_at
       FROM enrollments e
       JOIN users u ON e.user_id = u.id
       JOIN courses c ON e.course_id = c.id
       WHERE c.instructor_id = $1
       ORDER BY e.created_at DESC
       LIMIT 10`,
      [instructorId]
    );

    // Mock Chart Data for Revenue/Enrollments over months
    const monthlyStats = [
      { month: 'Jan', revenue: totalRevenue * 0.1, enrollments: Math.ceil(totalStudents * 0.12) },
      { month: 'Feb', revenue: totalRevenue * 0.15, enrollments: Math.ceil(totalStudents * 0.18) },
      { month: 'Mar', revenue: totalRevenue * 0.3, enrollments: Math.ceil(totalStudents * 0.28) },
      { month: 'Apr', revenue: totalRevenue * 0.5, enrollments: Math.ceil(totalStudents * 0.45) },
      { month: 'May', revenue: totalRevenue * 0.75, enrollments: Math.ceil(totalStudents * 0.72) },
      { month: 'Jun', revenue: totalRevenue, enrollments: totalStudents }
    ];

    return res.status(200).json({
      totalCourses,
      totalStudents,
      totalRevenue,
      courses,
      students: studentList,
      chartData: monthlyStats
    });
  } catch (error) {
    next(error);
  }
}

// Admin Dashboard Global Statistics
async function getAdminDashboard(req, res, next) {
  try {
    // Platform Counts
    const { rows: userCounts } = await db.query("SELECT COUNT(*) as count, role FROM users GROUP BY role");
    const { rows: courseCount } = await db.query("SELECT COUNT(*) as count FROM courses");
    const { rows: enrollmentCount } = await db.query("SELECT COUNT(*) as count FROM enrollments");

    const usersMap = {};
    userCounts.forEach(row => {
      usersMap[row.role] = parseInt(row.count);
    });

    const totalStudents = usersMap['student'] || 0;
    const totalInstructors = usersMap['instructor'] || 0;
    const totalAdmins = usersMap['admin'] || 0;

    // Calculate Platform Revenue (sum of all purchases)
    const { rows: revRows } = await db.query(
      'SELECT SUM(c.price) as revenue FROM enrollments e JOIN courses c ON e.course_id = c.id'
    );
    const platformRevenue = parseFloat(revRows[0].revenue || 0.00);

    // Pending instructor approvals
    const { rows: pendingInstructors } = await db.query(
      "SELECT id, name, email, avatar, created_at FROM users WHERE role = 'instructor' AND instructor_approved = FALSE ORDER BY created_at ASC"
    );

    // Fetch all courses for approval controls
    const { rows: courses } = await db.query(
      `SELECT c.id, c.title, c.category, c.price, c.approved, u.name as instructor_name
       FROM courses c
       JOIN users u ON c.instructor_id = u.id
       ORDER BY c.created_at DESC`
    );

    return res.status(200).json({
      stats: {
        totalStudents,
        totalInstructors,
        totalAdmins,
        totalCourses: parseInt(courseCount[0].count),
        totalEnrollments: parseInt(enrollmentCount[0].count),
        platformRevenue
      },
      pendingInstructors,
      courses
    });
  } catch (error) {
    next(error);
  }
}

// Approve a registered instructor
async function approveInstructor(req, res, next) {
  try {
    const { instructorId } = req.body;

    const { rows } = await db.query(
      "UPDATE users SET instructor_approved = TRUE WHERE id = $1 AND role = 'instructor' RETURNING id, name, email",
      [instructorId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Instructor not found or invalid user role' });
    }

    return res.status(200).json({
      instructor: rows[0],
      message: 'Instructor approved successfully!'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStudentDashboard,
  getInstructorDashboard,
  getAdminDashboard,
  approveInstructor
};
