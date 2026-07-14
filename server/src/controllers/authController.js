const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Helper to generate JWT Token
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret_key_12345', {
    expiresIn: '30d'
  });
}

// Helper to calculate streak updates
function updateStreakLogic(lastActiveDateStr, currentStreak = 0) {
  if (!lastActiveDateStr) return { streak: 1, lastActive: new Date() };

  const lastActive = new Date(lastActiveDateStr);
  const today = new Date();

  // Reset time portions for comparison
  const d1 = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
  const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already active today, streak stays the same
    return { streak: currentStreak, lastActive: today };
  } else if (diffDays === 1) {
    // Consecutive day, increment streak
    return { streak: currentStreak + 1, lastActive: today };
  } else {
    // Streak broken, reset to 1
    return { streak: 1, lastActive: today };
  }
}

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields: name, email, password' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address format' });
    }

    // Check password strength (at least 6 characters, one letter and one number)
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const { rows: existing } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'student';
    const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
    const instructorApproved = userRole === 'instructor' ? false : true; // Instructors need approval

    const todayStr = new Date().toISOString().split('T')[0];

    const { rows } = await db.query(
      `INSERT INTO users (name, email, password, role, avatar, instructor_approved, xp, streak, last_active_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, name, email, role, avatar, xp, streak`,
      [name, email, hashedPassword, userRole, avatar, instructorApproved, 100, 1, todayStr]
    );

    const user = rows[0];
    const token = generateToken(user.id);

    return res.status(201).json({
      user,
      token,
      message: userRole === 'instructor' 
        ? 'Registration successful! Your instructor profile is pending administrator approval.'
        : 'Registration successful!'
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    // Check if user exists
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check instructor approval status
    if (user.role === 'instructor' && !user.instructor_approved) {
      return res.status(403).json({ message: 'Your instructor account has not been approved by an administrator yet.' });
    }

    // Update login streak and active date
    const streakUpdate = updateStreakLogic(user.last_active_date, user.streak);
    await db.query(
      'UPDATE users SET streak = $1, last_active_date = $2 WHERE id = $3',
      [streakUpdate.streak, streakUpdate.lastActive.toISOString().split('T')[0], user.id]
    );

    // Update locally returned object
    user.streak = streakUpdate.streak;

    const token = generateToken(user.id);
    
    // Remove password hash from response
    delete user.password;

    return res.status(200).json({
      user,
      token,
      message: 'Logged in successfully!'
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    // req.user is populated by protect middleware
    return res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const { rows } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No account registered with this email address' });
    }

    // Return mock reset link/code for the UI to consume directly since we do not have an active SMTP server
    const mockResetToken = Math.random().toString(36).substring(2, 8).toUpperCase();
    return res.status(200).json({
      message: 'Reset instructions sent to your email (Mock Verification Code: ' + mockResetToken + ')',
      resetCode: mockResetToken
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, email, password, avatar } = req.body;
    const userId = req.user.id;

    let updateFields = [];
    let params = [];
    let idx = 1;

    if (name) {
      updateFields.push(`name = $${idx++}`);
      params.push(name);
    }
    if (email) {
      updateFields.push(`email = $${idx++}`);
      params.push(email);
    }
    if (avatar) {
      updateFields.push(`avatar = $${idx++}`);
      params.push(avatar);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push(`password = $${idx++}`);
      params.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No profile details provided for update' });
    }

    params.push(userId);
    const queryStr = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role, avatar, xp, streak`;
    
    const { rows } = await db.query(queryStr, params);

    return res.status(200).json({
      user: rows[0],
      message: 'Profile updated successfully!'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  updateProfile
};
