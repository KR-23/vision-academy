import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ExploreCourses from './pages/ExploreCourses';
import CourseDetails from './pages/CourseDetails';
import CoursePlayer from './pages/CoursePlayer';
import QuizPage from './pages/QuizPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentCourses from './pages/StudentCourses';
import StudentWishlist from './pages/StudentWishlist';
import StudentLeaderboard from './pages/StudentLeaderboard';
import StudentCertificates from './pages/StudentCertificates';
import VerifyCertificate from './pages/VerifyCertificate';
import ProfileSettings from './pages/ProfileSettings';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Views */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/courses" element={<ExploreCourses />} />
              <Route path="/courses/:id" element={<CourseDetails />} />
              <Route path="/verify/:certificateNumber" element={<VerifyCertificate />} />

              {/* Student Protected Views */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/courses"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/wishlist"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentWishlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/leaderboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentLeaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/certificates"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentCertificates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:id/player"
                element={
                  <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
                    <CoursePlayer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/lessons/:lessonId/quiz"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <QuizPage />
                  </ProtectedRoute>
                }
              />

              {/* Universal profile settings */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
                    <ProfileSettings />
                  </ProtectedRoute>
                }
              />

              {/* Instructor Protected Views */}
              <Route
                path="/instructor"
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/courses"
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/create-course"
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/submissions"
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Views */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/instructors"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}
