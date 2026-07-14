import React, { useEffect, useState } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { 
  PlusCircle, BookOpen, Users, IndianRupee, LayoutDashboard, 
  FileSpreadsheet, Trash2, Edit3, Send, Check, Loader2, ArrowUpRight 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstructorDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'courses' | 'grading'

  // Modal / Form triggers
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Course Form
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseCat, setCourseCat] = useState('Programming');
  const [coursePrice, setCoursePrice] = useState('');
  const [courseDifficulty, setCourseDifficulty] = useState('Beginner');
  const [courseDuration, setCourseDuration] = useState('10 hours');
  const [courseThumbnail, setCourseThumbnail] = useState(null);

  // Lesson Form
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonDuration, setLessonDuration] = useState('15 mins');
  const [lessonSortOrder, setLessonSortOrder] = useState('1');
  const [lessonVideo, setLessonVideo] = useState(null);

  // Assignment Form
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('');

  // Grading states
  const [gradingSubId, setGradingSubId] = useState(null);
  const [studentGrade, setStudentGrade] = useState('A');
  const [studentFeedback, setStudentFeedback] = useState('');
  const [submissions, setSubmissions] = useState([]);

  // Submit loaders
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchInstructorData();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'grading') {
      fetchGradingSubmissions();
    }
  }, [activeSubTab, stats]);

  async function fetchInstructorData() {
    try {
      const { data } = await API.get('/analytics/instructor');
      setStats(data);
    } catch (err) {
      console.error(err);
      toast('Failed to load instructor stats', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchGradingSubmissions() {
    if (!stats || stats.courses.length === 0) return;
    
    // Fetch submissions for each course the instructor owns
    const allSubs = [];
    for (const course of stats.courses) {
      try {
        // Fetch assignments for the course
        const { data: asgData } = await API.get(`/assignments/courses/${course.id}`);
        for (const asg of asgData.assignments) {
          const { data: subData } = await API.get(`/assignments/submissions/${asg.id}`);
          subData.submissions.forEach(sub => {
            allSubs.push({
              ...sub,
              assignmentTitle: asg.title,
              courseTitle: course.title
            });
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
    setSubmissions(allSubs);
  }

  // CREATE COURSE
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);

    const formData = new FormData();
    formData.append('title', courseTitle);
    formData.append('description', courseDesc);
    formData.append('category', courseCat);
    formData.append('price', coursePrice || '0');
    formData.append('difficulty', courseDifficulty);
    formData.append('duration', courseDuration);
    if (courseThumbnail) {
      formData.append('thumbnail', courseThumbnail);
    }

    try {
      const { data } = await API.post('/courses', formData);
      toast(data.message, 'success');
      setShowCourseModal(false);
      
      // Reset form
      setCourseTitle('');
      setCourseDesc('');
      setCoursePrice('');
      
      fetchInstructorData();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  // ADD LESSON
  const handleCreateLesson = async (e) => {
    e.preventDefault();
    setCreating(true);

    const formData = new FormData();
    formData.append('courseId', selectedCourseId);
    formData.append('title', lessonTitle);
    formData.append('description', lessonDesc);
    formData.append('duration', lessonDuration);
    formData.append('sortOrder', lessonSortOrder);
    if (lessonVideo) {
      formData.append('video', lessonVideo);
    }

    try {
      const { data } = await API.post('/courses/lessons/create', formData);
      toast(data.message, 'success');
      setShowLessonModal(false);
      
      // Reset
      setLessonTitle('');
      setLessonDesc('');
      setLessonVideo(null);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  // ADD ASSIGNMENT
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { data } = await API.post('/assignments/create', {
        courseId: selectedCourseId,
        title: asgTitle,
        description: asgDesc,
        dueDate: asgDueDate
      });
      toast(data.message, 'success');
      setShowAssignmentModal(false);
      
      // Reset
      setAsgTitle('');
      setAsgDesc('');
      setAsgDueDate('');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  // GRADE SUBMISSION
  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put(`/assignments/submissions/${gradingSubId}/grade`, {
        grade: studentGrade,
        feedback: studentFeedback
      });
      toast(data.message, 'success');
      setGradingSubId(null);
      setStudentFeedback('');
      fetchGradingSubmissions(); // reload submissions
    } catch (err) {
      toast(err.message, 'error');
    }
  };

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
      <Sidebar role="instructor" />

      {/* Main Container */}
      <div className="md:pl-64 pt-6 min-h-[calc(100vh-4rem)]">
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          
          {/* Dashboard Tabs Header */}
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-905 ">Instructor Studio</h1>
              <p className="mt-1 text-sm text-text-secondary">Author courses, add technical checkpoints, and grade submissions.</p>
            </div>

            <div className="flex bg-bg-secondary p-1.5 rounded-xl  shrink-0">
              <button
                onClick={() => setActiveSubTab('overview')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeSubTab === 'overview'
                    ? 'bg-primary text-white shadow-sm  '
                    : 'text-text-secondary hover:text-text-main '
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Overview
              </button>
              <button
                onClick={() => setActiveSubTab('courses')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeSubTab === 'courses'
                    ? 'bg-primary text-white shadow-sm  '
                    : 'text-text-secondary hover:text-text-main '
                }`}
              >
                <BookOpen className="w-4 h-4" />
                My Courses
              </button>
              <button
                onClick={() => setActiveSubTab('grading')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeSubTab === 'grading'
                    ? 'bg-primary text-white shadow-sm  '
                    : 'text-text-secondary hover:text-text-main '
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Grading Hub
              </button>
            </div>
          </div>

          {/* OVERVIEW TAB */}
          {activeSubTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Course Count */}
                <div className="glass p-6 rounded-2xl bg-bg-main  shadow-soft">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Courses</span>
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-3xl font-extrabold text-text-main ">{stats?.totalCourses || 0}</span>
                </div>

                {/* Total Students */}
                <div className="glass p-6 rounded-2xl bg-bg-main  shadow-soft">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Students</span>
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-3xl font-extrabold text-slate-955 ">{stats?.totalStudents || 0}</span>
                </div>

                {/* Revenue stats */}
                <div className="glass p-6 rounded-2xl bg-bg-main shadow-soft">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Earnings (Mock, ₹)</span>
                    <IndianRupee className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-3xl font-extrabold text-text-main">₹{stats?.totalRevenue ? stats.totalRevenue.toFixed(2) : '0.00'}</span>
                </div>
              </div>

              {/* Roster of student enrollments */}
              <div className="glass p-6 rounded-2xl bg-bg-main  shadow-soft">
                <h3 className="font-extrabold text-sm text-text-main  mb-6">Recent Enrollments</h3>
                {stats?.students && stats.students.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats.students.map((student, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full" />
                          <div>
                            <span className="text-sm font-bold text-slate-850 ">{student.name}</span>
                            <p className="text-xs text-slate-400">Enrolled in {student.course_title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-805 ">{student.progress}% Done</span>
                          <span className="text-[10px] text-slate-400 block">{new Date(student.enrolled_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No students enrolled yet.</p>
                )}
              </div>
            </div>
          )}

          {/* MY COURSES TAB */}
          {activeSubTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCourseModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2.5 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Course
                </button>
              </div>

              {stats?.courses && stats.courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stats.courses.map(course => (
                    <div 
                      key={course.id}
                      className="glass p-5 rounded-2xl bg-bg-main  border border-accent/20 dark:border-accent/20 flex flex-col justify-between"
                    >
                      <div>
                        <img src={course.thumbnail} className="w-full aspect-video rounded-xl object-cover mb-4" />
                        <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">{course.category}</span>
                        <h4 className="font-bold text-sm text-text-main  mt-1 leading-snug line-clamp-1">{course.title}</h4>
                        <span className="text-xs text-text-secondary mt-2 block">{course.student_count} students enrolled</span>
                      </div>

                      {/* Course Tools */}
                      <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-accent/20 dark:border-accent/20">
                        <button
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setShowLessonModal(true);
                          }}
                          className="flex-1 rounded-xl bg-bg-secondary hover:bg-accent/10 hover:text-primary font-bold text-[10px] text-text-secondary py-2   dark:hover:bg-slate-700 transition-colors"
                        >
                          + Lesson
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setShowAssignmentModal(true);
                          }}
                          className="flex-1 rounded-xl bg-bg-secondary hover:bg-accent/10 hover:text-primary font-bold text-[10px] text-text-secondary py-2   dark:hover:bg-slate-700 transition-colors"
                        >
                          + Task
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-accent/30 rounded-2xl p-16 text-center dark:border-accent/20">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-text-secondary ">No courses authored yet</p>
                  <p className="text-xs text-text-secondary mt-1 mb-4">Launch your first course catalog item using the create trigger above.</p>
                </div>
              )}
            </div>
          )}

          {/* GRADING HUB TAB */}
          {activeSubTab === 'grading' && (
            <div className="glass p-6 rounded-2xl bg-bg-main  shadow-soft">
              <h3 className="font-extrabold text-sm text-text-main  mb-6">Student Submissions</h3>
              {submissions.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="py-5 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div>
                          <h4 className="font-bold text-sm text-text-main ">{sub.student_name}</h4>
                          <p className="text-xs text-text-secondary">
                            Course: {sub.courseTitle} | Task: <span className="font-semibold text-text-secondary ">{sub.assignmentTitle}</span>
                          </p>
                          <a 
                            href={sub.file_url} 
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline  mt-2"
                          >
                            View Student Attachment File
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
                        </div>

                        <div className="text-right">
                          <span className={`text-xs font-bold block ${sub.grade ? 'text-primary' : 'text-amber-500'}`}>
                            {sub.grade ? `Grade: ${sub.grade}` : 'Needs Review'}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1">Submitted: {new Date(sub.submitted_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Grade Form Trigger */}
                      {!sub.grade && (
                        <div className="mt-4">
                          {gradingSubId === sub.id ? (
                            <form onSubmit={handleGradeSubmission} className="bg-bg-secondary p-4 rounded-xl border border-slate-150  dark:border-accent/20 space-y-4">
                              <div className="flex gap-4">
                                <div className="w-24 shrink-0">
                                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Grade</label>
                                  <select
                                    value={studentGrade}
                                    onChange={(e) => setStudentGrade(e.target.value)}
                                    className="w-full rounded-lg border border-accent/30 bg-bg-main p-2 text-xs dark:border-slate-700  "
                                  >
                                    <option value="A+">A+</option>
                                    <option value="A">A</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B">B</option>
                                    <option value="B-">B-</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                  </select>
                                </div>
                                <div className="flex-1">
                                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Feedback</label>
                                  <input
                                    type="text"
                                    value={studentFeedback}
                                    onChange={(e) => setStudentFeedback(e.target.value)}
                                    required
                                    placeholder="Write notes (e.g. Great API design pattern usage...)"
                                    className="w-full rounded-lg border border-accent/30 bg-bg-main p-2 text-xs dark:border-slate-700  "
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  className="rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-[10px] px-3.5 py-2"
                                >
                                  Submit Review
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setGradingSubId(null)}
                                  className="text-[10px] text-text-secondary py-2 px-2"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <button
                              onClick={() => {
                                setGradingSubId(sub.id);
                                setStudentGrade('A');
                              }}
                              className="rounded-lg bg-bg-secondary hover:bg-accent/10 hover:text-primary text-text-secondary font-bold text-[10px] px-3 py-1.5   mt-2"
                            >
                              Add Grade & Review
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No student submissions await review.</p>
              )}
            </div>
          )}

          {/* COURSE MODAL */}
          <AnimatePresence>
            {showCourseModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                <div className="absolute inset-0" onClick={() => setShowCourseModal(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative z-10 w-full max-w-lg bg-bg-main rounded-2xl p-6  shadow-xl border border-accent/30 dark:border-accent/20"
                >
                  <h3 className="font-extrabold text-base text-text-main  mb-4">Create New Course</h3>
                  <form onSubmit={handleCreateCourse} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">Course Title</label>
                      <input 
                        type="text" required value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)}
                        placeholder="e.g. Master Design Systems with Framer Motion"
                        className="w-full rounded-xl border border-accent/30 p-2.5 text-sm dark:border-accent/20  "
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">Description</label>
                      <textarea 
                        required value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)}
                        placeholder="Provide details about the track's syllabus..."
                        className="w-full rounded-xl border border-accent/30 p-2.5 text-sm dark:border-accent/20  "
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Category</label>
                        <select 
                          value={courseCat} onChange={(e) => setCourseCat(e.target.value)}
                          className="w-full rounded-xl border border-accent/30 p-2.5 text-sm dark:border-accent/20  "
                        >
                          <option value="Programming">Programming</option>
                          <option value="AI">AI</option>
                          <option value="Design">Design</option>
                          <option value="Business">Business</option>
                          <option value="Cyber Security">Cyber Security</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Price (USD)</label>
                        <input 
                          type="number" value={coursePrice} onChange={(e) => setCoursePrice(e.target.value)}
                          placeholder="0.00 for Free"
                          className="w-full rounded-xl border border-accent/30 p-2.5 text-sm dark:border-accent/20  "
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">Cover Thumbnail Upload</label>
                      <input 
                        type="file" onChange={(e) => setCourseThumbnail(e.target.files[0])}
                        className="w-full text-xs"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-4">
                      <button
                        type="button" onClick={() => setShowCourseModal(false)}
                        className="rounded-xl bg-bg-secondary hover:bg-slate-200 px-4 py-2 text-xs font-semibold text-text-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit" disabled={creating}
                        className="flex items-center gap-1 rounded-xl bg-primary text-white font-bold text-xs px-4 py-2"
                      >
                        {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Course'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* LESSON MODAL */}
          <AnimatePresence>
            {showLessonModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                <div className="absolute inset-0" onClick={() => setShowLessonModal(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative z-10 w-full max-w-lg bg-bg-main rounded-2xl p-6  shadow-xl border border-accent/30 dark:border-accent/20"
                >
                  <h3 className="font-extrabold text-base text-text-main  mb-4">Add Lesson</h3>
                  <form onSubmit={handleCreateLesson} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">Lesson Title</label>
                      <input 
                        type="text" required value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)}
                        placeholder="e.g. Setting up Express routing"
                        className="w-full rounded-xl border border-accent/30 p-2.5 text-sm dark:border-accent/20 "
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">Description</label>
                      <textarea 
                        value={lessonDesc} onChange={(e) => setLessonDesc(e.target.value)}
                        placeholder="Brief lesson notes..."
                        className="w-full rounded-xl border border-accent/30 p-2.5 text-sm dark:border-accent/20 "
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Duration (e.g. 15 mins)</label>
                        <input 
                          type="text" value={lessonDuration} onChange={(e) => setLessonDuration(e.target.value)}
                          className="w-full rounded-xl border border-accent/30 p-2.5 text-sm dark:border-accent/20 "
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Sort Order (number)</label>
                        <input 
                          type="number" value={lessonSortOrder} onChange={(e) => setLessonSortOrder(e.target.value)}
                          className="w-full rounded-xl border border-accent/30 p-2.5 text-sm dark:border-accent/20 "
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">Upload Lesson Video MP4</label>
                      <input 
                        type="file" onChange={(e) => setLessonVideo(e.target.files[0])}
                        className="w-full text-xs"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-4">
                      <button
                        type="button" onClick={() => setShowLessonModal(false)}
                        className="rounded-xl bg-bg-secondary hover:bg-slate-200 px-4 py-2 text-xs font-semibold text-text-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit" disabled={creating}
                        className="flex items-center gap-1 rounded-xl bg-primary text-white font-bold text-xs px-4 py-2"
                      >
                        {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Lesson'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ASSIGNMENT MODAL */}
          <AnimatePresence>
            {showAssignmentModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                <div className="absolute inset-0" onClick={() => setShowAssignmentModal(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative z-10 w-full max-w-lg bg-bg-main rounded-2xl p-6  shadow-xl border border-accent/30 dark:border-accent/20"
                >
                  <h3 className="font-extrabold text-base text-text-main  mb-4">Add Project/Assignment</h3>
                  <form onSubmit={handleCreateAssignment} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">Project Title</label>
                      <input 
                        type="text" required value={asgTitle} onChange={(e) => setAsgTitle(e.target.value)}
                        placeholder="e.g. Build an Express REST API"
                        className="w-full rounded-xl border border-accent/30 p-2.5 text-sm dark:border-accent/20 "
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">Instructions / Description</label>
                      <textarea 
                        required value={asgDesc} onChange={(e) => setAsgDesc(e.target.value)}
                        placeholder="Provide details about the project requirements..."
                        className="w-full rounded-xl border border-accent/30 p-2.5 text-sm dark:border-accent/20 "
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1">Due Date</label>
                      <input 
                        type="datetime-local" required value={asgDueDate} onChange={(e) => setAsgDueDate(e.target.value)}
                        className="w-full rounded-xl border border-accent/30 p-2.5 text-sm dark:border-accent/20 "
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-4">
                      <button
                        type="button" onClick={() => setShowAssignmentModal(false)}
                        className="rounded-xl bg-bg-secondary hover:bg-slate-200 px-4 py-2 text-xs font-semibold text-text-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit" disabled={creating}
                        className="flex items-center gap-1 rounded-xl bg-primary text-white font-bold text-xs px-4 py-2"
                      >
                        {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Task'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </main>
      </div>
      <Footer />
    </div>
  );
}
