import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Flame, Star, Sun, Moon, Menu, X, LogOut, User, BookOpen, Search, LogIn, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'instructor') return '/instructor';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-[50] w-full border-b border-accent/30/80 bg-bg-main/75 backdrop-blur-md dark:border-accent/20/80 /75 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-sans font-bold text-xl tracking-tight text-text-main">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20 dark:shadow-none">
                VA
              </span>
              <span>Vision <span className="text-primary">Academy</span></span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/courses"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/courses'
                    ? 'text-primary '
                    : 'text-text-secondary hover:text-text-main  '
                }`}
              >
                Explore Courses
              </Link>
              {user && (
                <Link
                  to={getDashboardLink()}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/instructor') || location.pathname.startsWith('/admin')
                      ? 'text-primary '
                      : 'text-text-secondary hover:text-text-main  '
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Gamification indicators (only for logged-in students/instructors) */}
            {user && user.role !== 'admin' && (
              <div className="flex items-center gap-3 bg-bg-secondary/80 px-3 py-1.5 rounded-full /80">
                {/* Streak */}
                <div className="flex items-center gap-1 text-orange-600 font-bold text-sm" title="Learning Streak">
                  <Flame className="w-4.5 h-4.5 fill-orange-600 animate-pulse" />
                  <span>{user.streak || 0}d</span>
                </div>
                <div className="h-4 w-px bg-slate-200 " />
                {/* XP */}
                <div className="flex items-center gap-1 text-primary font-bold text-sm " title="XP Points">
                  <Star className="w-4.5 h-4.5 fill-indigo-600 text-primary dark:fill-indigo-400 " />
                  <span>{user.xp || 0} XP</span>
                </div>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-text-secondary hover:bg-bg-secondary rounded-lg   transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Profile Dropdown or Auth buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(prev => !prev)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-9 h-9 rounded-full border border-accent/30 object-cover dark:border-accent/20"
                  />
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-accent/30 bg-bg-main p-2 shadow-xl dark:border-accent/20  z-20"
                      >
                        <div className="px-3 py-2 border-b border-accent/20 dark:border-accent/20 mb-1">
                          <p className="text-sm font-semibold text-text-main  truncate">{user.name}</p>
                          <p className="text-xs text-text-secondary  truncate capitalize">{user.role}</p>
                        </div>
                        
                        <Link
                          to="/profile"
                          onClick={() => setShowDropdown(false)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-secondary   transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Profile Settings
                        </Link>
                        
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setShowDropdown(false)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-secondary   transition-colors"
                        >
                          <BookOpen className="w-4 h-4" />
                          My Dashboard
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary hover:bg-accent/10 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors mt-1"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1 text-sm font-semibold text-text-secondary px-4 py-2 hover:bg-bg-secondary rounded-xl   transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold text-white bg-primary px-4 py-2 hover:bg-primary-hover rounded-xl shadow-sm transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="md:hidden flex items-center gap-2">
            {/* Theme Toggle for mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 text-text-secondary hover:bg-bg-secondary rounded-lg   transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-text-secondary hover:bg-bg-secondary rounded-lg   focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-accent/20 bg-bg-main px-4 py-4 dark:border-accent/20  shadow-inner"
          >
            <div className="flex flex-col gap-3">
              <Link
                to="/courses"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-text-secondary hover:text-text-main py-1.5 "
              >
                Explore Courses
              </Link>
              {user && (
                <Link
                  to={getDashboardLink()}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-text-secondary hover:text-text-main py-1.5 "
                >
                  My Dashboard
                </Link>
              )}
              {user && (
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-text-secondary hover:text-text-main py-1.5 "
                >
                  Profile Settings
                </Link>
              )}

              {user && (
                <div className="flex items-center gap-4 bg-bg-secondary/80 p-2.5 rounded-xl /80 my-1">
                  <div className="flex items-center gap-1 text-orange-600 font-bold text-sm">
                    <Flame className="w-4.5 h-4.5 fill-orange-600" />
                    <span>Streak: {user.streak || 0}d</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary font-bold text-sm ">
                    <Star className="w-4.5 h-4.5 fill-indigo-600 text-primary dark:fill-indigo-400 " />
                    <span>XP: {user.xp || 0}</span>
                  </div>
                </div>
              )}

              {user ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center gap-1 text-sm font-semibold text-text-secondary border border-accent/30 px-4 py-2.5 rounded-xl  dark:border-accent/20"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center text-sm font-semibold text-white bg-primary px-4 py-2.5 rounded-xl shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
