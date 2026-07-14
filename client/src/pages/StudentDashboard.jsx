import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { 
  Flame, Award, Trophy, BookOpen, Star, Calendar, 
  ArrowRight, Sparkles, GraduationCap, Clock, CheckCircle2 
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await API.get('/analytics/student');
        setStats(data);
      } catch (err) {
        console.error('Failed to load student stats:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-secondary ">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary  transition-colors">
      <Navbar />
      <Sidebar role="student" />

      {/* Main Container */}
      <div className="md:pl-64 pt-6 min-h-[calc(100vh-4rem)]">
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden p-8 rounded-3xl border border-accent/30/80 bg-bg-main shadow-soft dark:border-accent/20  mb-8"
          >
            {/* Soft decorative background circles */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-100 rounded-full blur-2xl " />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-cyan-100 rounded-full blur-2xl dark:bg-cyan-950/30" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-primary  mb-2">
                  <Sparkles className="w-3.5 h-3.5 fill-indigo-600 dark:fill-none" />
                  Your Study Progress
                </span>
                <h1 className="text-3xl font-extrabold text-text-main  leading-tight">
                  Welcome back, {user?.name}!
                </h1>
                <p className="mt-2 text-sm text-text-secondary  max-w-xl">
                  You are maintaining a {stats?.streak || 0}-day learning streak. Keep up the consistency to unlock advanced achievements!
                </p>
              </div>

              {/* Quick Actions / Streaks */}
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/20 px-4 py-2.5 rounded-2xl border border-orange-100 dark:border-orange-900/40">
                  <Flame className="w-6 h-6 text-orange-655 fill-orange-555 animate-bounce" />
                  <div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wider">Streak</p>
                    <p className="text-lg font-extrabold text-orange-700 dark:text-orange-300">{stats?.streak || 0} Days</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-accent/10 dark:bg-indigo-950/20 px-4 py-2.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                  <Star className="w-6 h-6 text-primary fill-indigo-500" />
                  <div>
                    <p className="text-xs text-primary  font-semibold uppercase tracking-wider">Total XP</p>
                    <p className="text-lg font-extrabold text-primary ">{stats?.xp || 0} XP</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats & Streak Goal Tracker */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Daily Goal Card */}
            <div className="glass p-6 rounded-2xl bg-bg-main  shadow-soft col-span-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-text-main ">Daily XP Goal</h3>
                <span className="text-xs font-semibold text-text-secondary">{stats?.dailyGoalProgress || 0}%</span>
              </div>
              <p className="text-xs text-slate-555 mb-4 ">Complete lessons and pass quizzes to hit your daily goal.</p>
              
              <div className="h-2 w-full bg-bg-secondary rounded-full  overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `₹{stats?.dailyGoalProgress || 0}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs font-bold text-slate-805 ">
                {stats?.xp % 100} / 100 XP
              </span>
            </div>

            {/* Badges Summary */}
            <div className="glass p-6 rounded-2xl bg-bg-main  shadow-soft col-span-1 lg:col-span-2">
              <h3 className="font-bold text-sm text-text-main  mb-4">Achievement Badges</h3>
              {stats?.badges && stats.badges.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {stats.badges.map(badge => (
                    <div 
                      key={badge.id}
                      className="flex items-center gap-2.5 bg-bg-secondary  p-2.5 rounded-xl border border-accent/20 dark:border-slate-700"
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${badge.color} text-white`}>
                        {badge.id === 'novice' && <Sparkles className="w-4 h-4" />}
                        {badge.id === 'scholar' && <GraduationCap className="w-4 h-4" />}
                        {badge.id === 'master' && <Trophy className="w-4 h-4" />}
                        {badge.id === 'streak_legend' && <Flame className="w-4 h-4 fill-white text-white" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text-main  leading-tight">{badge.name}</h4>
                        <p className="text-[10px] text-text-secondary ">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Earn at least 100 XP to unlock your first learning badge.</p>
              )}
            </div>
          </div>

          {/* Enrolled Courses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-text-main ">Enrolled Courses</h2>
                <Link to="/courses" className="text-sm font-semibold text-primary hover:text-primary-hover ">Explore more</Link>
              </div>

              {stats?.enrolledCourses && stats.enrolledCourses.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {stats.enrolledCourses.map((course) => (
                    <div
                      key={course.course_id}
                      className="glass flex flex-col sm:flex-row gap-5 p-5 rounded-2xl bg-bg-main hover:shadow-soft transition-all "
                    >
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full sm:w-36 aspect-video rounded-xl object-cover bg-bg-secondary"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1.5 block">
                            {course.category}
                          </span>
                          <h3 className="font-bold text-base text-text-main  leading-snug line-clamp-1">
                            {course.title}
                          </h3>
                          <p className="text-xs text-text-secondary  mt-1">
                            By {course.instructor_name}
                          </p>
                        </div>

                        {/* Progress */}
                        <div className="mt-4">
                          <div className="flex justify-between text-[11px] font-semibold text-text-secondary mb-1">
                            <span>Course Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-bg-secondary rounded-full  overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `₹{course.progress}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="self-end sm:self-center">
                        <Link
                          to={`/courses/${course.course_id}`}
                          className="flex items-center gap-1.5 rounded-xl bg-bg-secondary hover:bg-accent/10 hover:text-primary px-4 py-2.5 text-xs font-bold text-text-secondary   dark:hover:bg-slate-700 transition-colors"
                        >
                          Resume
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-accent/30 rounded-2xl p-10 text-center dark:border-accent/20">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-text-secondary ">No enrolled courses yet</p>
                  <p className="text-xs text-text-secondary mt-1 mb-4">Enroll in a course to kickstart your learning journey.</p>
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition-colors"
                  >
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar Cards */}
            <div className="flex flex-col gap-6">
              {/* Upcoming Assignments */}
              <div className="glass p-6 rounded-2xl bg-bg-main  shadow-soft">
                <h3 className="font-bold text-sm text-text-main  mb-4 flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-primary" />
                  Upcoming Submissions
                </h3>
                {stats?.upcomingAssignments && stats.upcomingAssignments.length > 0 ? (
                  <div className="space-y-4">
                    {stats.upcomingAssignments.map(asg => (
                      <div key={asg.id} className="border-l-2 border-primary pl-3">
                        <h4 className="text-xs font-bold text-text-main  line-clamp-1">{asg.title}</h4>
                        <p className="text-[10px] text-text-secondary mb-1">{asg.course_title}</p>
                        <span className="text-[10px] font-semibold text-slate-400">
                          Due: {new Date(asg.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No pending assignments due soon.</p>
                )}
              </div>

              {/* Recent Activity Log */}
              <div className="glass p-6 rounded-2xl bg-bg-main  shadow-soft">
                <h3 className="font-bold text-sm text-text-main  mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 text-primary" />
                  Recent Activity
                </h3>
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentActivity.map((act, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-accent/100 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-slate-750  leading-snug">{act.title}</p>
                          <span className="text-[10px] text-slate-400">{new Date(act.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Complete tasks to populate activity tracking logs.</p>
                )}
              </div>
            </div>
          </div>

        </main>
      </div>
      <Footer />
    </div>
  );
}
