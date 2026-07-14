const db = require('../config/db');

// Get quiz and questions for a lesson
async function getQuizByLessonId(req, res, next) {
  try {
    const { lessonId } = req.params;

    // Fetch quiz metadata
    const { rows: quizRows } = await db.query('SELECT * FROM quizzes WHERE lesson_id = $1', [lessonId]);
    if (quizRows.length === 0) {
      return res.status(404).json({ message: 'No quiz found for this lesson.' });
    }

    const quiz = quizRows[0];

    // Fetch questions
    const { rows: questionRows } = await db.query(
      'SELECT id, question, options FROM questions WHERE quiz_id = $1 ORDER BY id ASC',
      [quiz.id]
    );

    // Map questions to parse options JSON safely (Postgres might return object, SQLite returns string)
    const questions = questionRows.map((q) => {
      let options = q.options;
      if (typeof options === 'string') {
        try {
          options = JSON.parse(options);
        } catch (e) {
          options = [];
        }
      }
      return {
        id: q.id,
        question: q.question,
        options
      };
    });

    return res.status(200).json({ quiz, questions });
  } catch (error) {
    next(error);
  }
}

// Create a quiz and add questions (Instructor/Admin)
async function createQuiz(req, res, next) {
  try {
    const { lessonId, title, questions } = req.body; // questions: [{ question, options: [], correct_answer }]
    const userId = req.user.id;

    // Verify course ownership
    const { rows: lessonRows } = await db.query(
      'SELECT c.instructor_id FROM lessons l JOIN courses c ON l.course_id = c.id WHERE l.id = $1',
      [lessonId]
    );

    if (lessonRows.length === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    if (lessonRows[0].instructor_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to create quizzes for this course' });
    }

    // Insert Quiz metadata
    const { rows: quizRows } = await db.query(
      'INSERT INTO quizzes (lesson_id, title) VALUES ($1, $2) RETURNING *',
      [lessonId, title]
    );
    const quiz = quizRows[0];

    // Insert questions
    const insertedQuestions = [];
    if (questions && Array.isArray(questions)) {
      for (const q of questions) {
        const optionsStr = JSON.stringify(q.options);
        const { rows: qRows } = await db.query(
          'INSERT INTO questions (quiz_id, question, options, correct_answer) VALUES ($1, $2, $3, $4) RETURNING id, question, options',
          [quiz.id, q.question, optionsStr, q.correct_answer]
        );
        insertedQuestions.push(qRows[0]);
      }
    }

    return res.status(201).json({
      quiz,
      questions: insertedQuestions,
      message: 'Quiz created successfully!'
    });
  } catch (error) {
    next(error);
  }
}

// Submit quiz answers, compute score, and award XP
async function submitQuiz(req, res, next) {
  try {
    const { quizId, answers } = req.body; // answers: { [questionId]: "Selected Option Value" }
    const userId = req.user.id;

    // Get correct answers
    const { rows: correctAnswers } = await db.query(
      'SELECT id, correct_answer FROM questions WHERE quiz_id = $1',
      [quizId]
    );

    if (correctAnswers.length === 0) {
      return res.status(404).json({ message: 'Quiz questions not found.' });
    }

    let score = 0;
    const totalQuestions = correctAnswers.length;
    const reviewDetails = [];

    correctAnswers.forEach((q) => {
      const studentAnswer = answers[q.id];
      const isCorrect = studentAnswer === q.correct_answer;
      
      if (isCorrect) {
        score++;
      }

      reviewDetails.push({
        questionId: q.id,
        correctAnswer: q.correct_answer,
        studentAnswer: studentAnswer || 'No answer selected',
        isCorrect
      });
    });

    // Save score in DB
    await db.query(
      'INSERT INTO quiz_scores (user_id, quiz_id, score, total_questions) VALUES ($1, $2, $3, $4)',
      [userId, quizId, score, totalQuestions]
    );

    // Gamification XP Rewards
    const pct = (score / totalQuestions) * 100;
    let xpAwarded = 0;
    let feedback = '';

    if (pct === 100) {
      xpAwarded = 200; // Perfect score bonus
      feedback = 'Perfect Score! Exceptional work!';
    } else if (pct >= 80) {
      xpAwarded = 100;
      feedback = 'Excellent job, you passed!';
    } else if (pct >= 50) {
      xpAwarded = 50;
      feedback = 'Good effort! Try reviewing to improve your score.';
    } else {
      feedback = 'You did not pass this quiz. Review the material and try again.';
    }

    if (xpAwarded > 0) {
      await db.query('UPDATE users SET xp = xp + $1 WHERE id = $2', [xpAwarded, userId]);
    }

    // Get Quiz Leaderboard
    const { rows: leaderboard } = await db.query(
      `SELECT u.name, u.avatar, MAX(qs.score) as high_score, qs.total_questions, MAX(qs.created_at) as completed_at
       FROM quiz_scores qs
       JOIN users u ON qs.user_id = u.id
       WHERE qs.quiz_id = $1
       GROUP BY u.id, u.name, u.avatar, qs.total_questions
       ORDER BY high_score DESC, completed_at ASC
       LIMIT 5`,
      [quizId]
    );

    return res.status(200).json({
      score,
      totalQuestions,
      percentage: pct,
      review: reviewDetails,
      xpAwarded,
      feedback,
      leaderboard,
      passed: pct >= 70
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getQuizByLessonId,
  createQuiz,
  submitQuiz
};
