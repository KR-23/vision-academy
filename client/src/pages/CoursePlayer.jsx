import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Play, CheckCircle2, ChevronRight, MessageSquare, BookOpen, 
  Bookmark, Award, FileText, Send, Heart, Flame, Star, Loader2, ArrowRight
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CoursePlayer() {
  const { id } = useParams(); // Course ID
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  
  // Tabs: 'about' | 'forum' | 'notes' | 'assignments'
  const [activeTab, setActiveTab] = useState('about');
  
  // Loading indicators
  const [loading, setLoading] = useState(true);
  const [postingDiscussion, setPostingDiscussion] = useState(false);
  const [postingNote, setPostingNote] = useState(false);

  // Notes state
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  // Forum state
  const [discussions, setDiscussions] = useState([]);
  const [activeThread, setActiveThread] = useState(null); // Viewed thread detailed replies
  const [replies, setReplies] = useState([]);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newReplyContent, setNewReplyContent] = useState('');

  // Assignments
  const [assignments, setAssignments] = useState([]);
  const [submittingAsg, setSubmittingAsg] = useState(null); // active assignment ID being submitted
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    fetchPlayerData();
  }, [id]);

  useEffect(() => {
    if (lessons.length > 0) {
      fetchLessonNotes(lessons[activeLessonIdx].id);
    }
  }, [activeLessonIdx, lessons]);

  async function fetchPlayerData() {
    try {
      const { data } = await API.get(`/courses/${id}`);
      setCourse(data.course);
      setLessons(data.lessons);
      setCompletedLessons(data.completedLessons);
      setProgress(data.progress);
      
      // Load tabs data
      fetchDiscussions();
      fetchAssignments();
    } catch (err) {
      toast(err.message || 'Error loading course player', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Bookmarks & Notes
  async function fetchLessonNotes(lessonId) {
    try {
      const { data } = await API.get(`/courses/lessons/${lessonId}/bookmarks`);
      setNotes(data.bookmarks);
    } catch (err) {
      console.error(err);
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setPostingNote(true);
    const activeLesson = lessons[activeLessonIdx];
    const timestamp = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0;

    try {
      const { data } = await API.post('/courses/lessons/bookmark', {
        lessonId: activeLesson.id,
        note: newNote,
        timestamp
      });
      setNotes(prev => [...prev, data.bookmark]);
      setNewNote('');
      toast(data.message, 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setPostingNote(false);
    }
  };

  // Discussions Forum
  async function fetchDiscussions() {
    try {
      const { data } = await API.get(`/forums/courses/${id}`);
      setDiscussions(data.discussions);
    } catch (err) {
      console.error(err);
    }
  }

  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    setPostingDiscussion(true);
    try {
      const { data } = await API.post('/forums/create', {
        courseId: id,
        title: newThreadTitle,
        content: newThreadContent
      });
      setDiscussions(prev => [data.discussion, ...prev]);
      setNewThreadTitle('');
      setNewThreadContent('');
      toast(data.message, 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setPostingDiscussion(false);
    }
  };

  const handleViewThread = async (thread) => {
    setActiveThread(thread);
    try {
      const { data } = await API.get(`/forums/discussions/${thread.id}/replies`);
      setReplies(data.replies);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!newReplyContent.trim()) return;

    try {
      const { data } = await API.post('/forums/reply', {
        discussionId: activeThread.id,
        content: newReplyContent
      });
      setReplies(prev => [...prev, data.reply]);
      setNewReplyContent('');
      toast(data.message, 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleLikeThread = async (threadId) => {
    try {
      const { data } = await API.put(`/forums/discussions/${threadId}/like`);
      setDiscussions(prev => prev.map(d => d.id === threadId ? { ...d, likes: data.likes } : d));
      if (activeThread && activeThread.id === threadId) {
        setActiveThread(prev => ({ ...prev, likes: data.likes }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Assignments
  async function fetchAssignments() {
    try {
      const { data } = await API.get(`/assignments/courses/${id}`);
      setAssignments(data.assignments);
    } catch (err) {
      console.error(err);
    }
  }

  const handleUploadAssignment = async (e) => {
    e.preventDefault();
    if (!uploadFile || !submittingAsg) return;

    const formData = new FormData();
    formData.append('assignmentId', submittingAsg);
    formData.append('file', uploadFile);

    try {
      const { data } = await API.post('/assignments/submit', formData);
      toast(data.message, 'success');
      setUploadFile(null);
      setSubmittingAsg(null);
      fetchAssignments(); // reload assignment submission record
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  // Lesson Progress Completion
  const toggleLessonComplete = async (lessonId, currentStatus) => {
    try {
      const { data } = await API.post('/courses/lessons/progress', {
        lessonId,
        completed: !currentStatus
      });

      // Update completed lessons state
      if (!currentStatus) {
        setCompletedLessons(prev => [...prev, lessonId]);
      } else {
        setCompletedLessons(prev => prev.filter(lid => lid !== lessonId));
      }
      setProgress(data.progress);
      toast(data.message, 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  // Video finished callback
  const handleVideoEnded = () => {
    const activeLesson = lessons[activeLessonIdx];
    // Mark complete automatically if not already
    if (!completedLessons.includes(activeLesson.id)) {
      toggleLessonComplete(activeLesson.id, false);
    }

    // Auto navigate to next lesson
    if (activeLessonIdx < lessons.length - 1) {
      toast('Autoplay: Loading next lesson...', 'info');
      setTimeout(() => {
        setActiveLessonIdx(prev => prev + 1);
      }, 2000);
    }
  };

  // Format notes timestamps helper
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `₹{m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-secondary ">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent" />
      </div>
    );
  }

  const activeLesson = lessons[activeLessonIdx];

  return (
    <div className="min-h-screen bg-bg-secondary  transition-colors">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Course Header Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link to={`/courses/${id}`} className="text-xs text-primary font-bold hover:underline mb-1 block">
              ← Return to Syllabus Details
            </Link>
            <h1 className="text-2xl font-bold text-slate-905 ">{course?.title}</h1>
          </div>
          {progress === 100 && (
            <Link
              to="/dashboard/certificates"
              className="flex items-center gap-1.5 bg-accent/100 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <Award className="w-4 h-4" />
              Claim Certificate
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Player & Tabs */}
          <div className="lg:col-span-2">
            
            {/* HTML5 Video Player */}
            {activeLesson ? (
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-md border border-accent/30/50 dark:border-accent/20">
                <video
                  ref={videoRef}
                  key={activeLesson.id}
                  src={activeLesson.video_url}
                  controls
                  onEnded={handleVideoEnded}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-slate-200  flex items-center justify-center">
                <p className="text-sm text-slate-400">No lessons available.</p>
              </div>
            )}

            {/* Tabs Header */}
            <div className="flex border-b border-accent/20 dark:border-accent/20/80 mt-8 mb-6 text-sm font-medium gap-6">
              {[
                { id: 'about', label: 'About' },
                { id: 'forum', label: 'Discussion Board' },
                { id: 'notes', label: 'Bookmarks & Notes' },
                { id: 'assignments', label: 'Projects & Tasks' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setActiveThread(null); // clear detail thread view
                  }}
                  className={`pb-3 border-b-2 font-semibold transition-colors cursor-pointer ${
                    activeTab === tab.id 
                      ? 'border-primary text-primary  dark:border-indigo-400' 
                      : 'border-transparent text-text-secondary hover:text-text-main '
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tabs Content */}
            <div className="min-h-48">
              {activeTab === 'about' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="font-bold text-text-main  mb-2">{activeLesson?.title}</h3>
                  <p className="text-sm text-slate-550 leading-relaxed ">
                    {activeLesson?.description || 'Learn full-stack applications architecture. Take notes on key code bookmarks.'}
                  </p>
                </motion.div>
              )}

              {activeTab === 'notes' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {/* Add note form */}
                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note at the current video timestamp..."
                      className="flex-1 rounded-xl border border-accent/30 px-4 py-2.5 text-sm bg-bg-secondary dark:border-accent/20   focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="submit"
                      disabled={postingNote}
                      className="rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      Save Note
                    </button>
                  </form>

                  {/* List of notes */}
                  {notes.length > 0 ? (
                    <div className="space-y-3.5">
                      {notes.map(note => (
                        <div 
                          key={note.id}
                          className="flex items-start justify-between p-4 rounded-xl border border-accent/20 bg-bg-main dark:border-accent/20  shadow-soft"
                        >
                          <div>
                            <span 
                              onClick={() => {
                                if (videoRef.current) videoRef.current.currentTime = note.timestamp;
                              }}
                              className="inline-flex items-center gap-1 bg-accent/10 text-primary font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 cursor-pointer   dark:border-indigo-900/60 mb-2"
                            >
                              <Bookmark className="w-3 h-3 fill-indigo-600 dark:fill-none" />
                              {formatTime(note.timestamp)}
                            </span>
                            <p className="text-sm text-slate-805  font-medium">{note.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No notes written for this lesson. Bookmark code checkpoints using the field above.</p>
                  )}
                </motion.div>
              )}

              {activeTab === 'forum' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {activeThread ? (
                    // Detailed Thread View
                    <div className="space-y-6">
                      <button 
                        onClick={() => setActiveThread(null)}
                        className="text-xs font-bold text-text-secondary hover:text-text-main mb-4 "
                      >
                        ← Back to all discussions
                      </button>

                      {/* Original Thread Post */}
                      <div className="border border-accent/20 bg-bg-main p-5 rounded-2xl dark:border-slate-805 /60">
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <h3 className="font-extrabold text-base text-slate-905 ">{activeThread.title}</h3>
                          <button 
                            onClick={() => handleLikeThread(activeThread.id)}
                            className="flex items-center gap-1 text-slate-400 hover:text-primary"
                          >
                            <Heart className="w-4 h-4 fill-indigo-100" />
                            <span className="text-xs font-semibold">{activeThread.likes}</span>
                          </button>
                        </div>
                        <p className="text-sm text-slate-555 mb-4 ">{activeThread.content}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <img src={activeThread.user_avatar} className="w-5 h-5 rounded-full" />
                          <span>By {activeThread.user_name}</span>
                        </div>
                      </div>

                      {/* Replies List */}
                      <div className="space-y-4 pl-4 border-l-2 border-accent/20 dark:border-accent/20">
                        {replies.map(reply => (
                          <div 
                            key={reply.id}
                            className={`p-4 rounded-xl border ${
                              reply.is_instructor_answer 
                                ? 'bg-accent/10/50 border-primary/20 dark:bg-indigo-950/20 dark:border-indigo-900/50' 
                                : 'bg-bg-main border-accent/20 '
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-text-main ">{reply.user_name}</span>
                              {reply.is_instructor_answer && (
                                <span className="text-[9px] bg-primary text-white font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  Instructor Answer
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-655  leading-relaxed">{reply.content}</p>
                          </div>
                        ))}
                      </div>

                      {/* Reply Form */}
                      <form onSubmit={handlePostReply} className="flex gap-2">
                        <input
                          type="text"
                          value={newReplyContent}
                          onChange={(e) => setNewReplyContent(e.target.value)}
                          placeholder="Type your response..."
                          className="flex-1 rounded-xl border border-slate-205 px-4 py-2.5 text-sm bg-bg-secondary dark:border-accent/20   focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <button
                          type="submit"
                          className="rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2.5 transition-all"
                        >
                          Reply
                        </button>
                      </form>
                    </div>
                  ) : (
                    // Threads List View
                    <div className="space-y-6">
                      {/* Create discussion form */}
                      <form onSubmit={handlePostDiscussion} className="space-y-3 p-4 bg-bg-secondary/50 rounded-2xl /40">
                        <h4 className="text-xs font-bold text-text-secondary ">Ask a Question</h4>
                        <input
                          type="text"
                          placeholder="Topic Title (e.g. How does auth route validation behave?)"
                          value={newThreadTitle}
                          onChange={(e) => setNewThreadTitle(e.target.value)}
                          className="w-full rounded-xl border border-accent/30 bg-bg-main px-4 py-2 text-sm dark:border-accent/20   focus:outline-none"
                        />
                        <textarea
                          placeholder="Provide details about your query..."
                          rows={3}
                          value={newThreadContent}
                          onChange={(e) => setNewThreadContent(e.target.value)}
                          className="w-full rounded-xl border border-accent/30 bg-bg-main px-4 py-2 text-sm dark:border-accent/20   focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={postingDiscussion}
                          className="flex items-center gap-1 rounded-xl bg-indigo-655 hover:bg-primary-hover text-white font-bold text-xs px-4 py-2.5 transition-colors disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Post Thread
                        </button>
                      </form>

                      {/* Discussions Threads List */}
                      {discussions.length > 0 ? (
                        <div className="space-y-3">
                          {discussions.map(disc => (
                            <div 
                              key={disc.id}
                              className="flex items-center justify-between p-4 rounded-xl border border-accent/20 bg-bg-main dark:border-accent/20  shadow-soft hover:border-accent/30 cursor-pointer transition-all"
                              onClick={() => handleViewThread(disc)}
                            >
                              <div>
                                <h4 className="text-sm font-bold text-text-main  hover:text-primary">{disc.title}</h4>
                                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
                                  <span>{disc.reply_count || 0} comments</span>
                                  <span>•</span>
                                  <span>Posted by {disc.user_name}</span>
                                </div>
                              </div>

                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLikeThread(disc.id);
                                }}
                                className="flex items-center gap-1 text-slate-400 hover:text-primary p-1"
                              >
                                <Heart className="w-3.5 h-3.5" />
                                <span className="text-xs">{disc.likes}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No discussions posted yet. Be the first to start a thread!</p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'assignments' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {/* Quizzes list */}
                  {activeLesson && (
                    <div className="p-5 border border-indigo-100 bg-accent/10/20 rounded-2xl dark:border-indigo-900/30 dark:bg-indigo-950/10">
                      <h4 className="text-sm font-bold text-text-main  mb-1">Interactive Lesson Evaluation</h4>
                      <p className="text-xs text-text-secondary mb-4 ">Check your understanding of this lesson's syllabus points by completing the quiz.</p>
                      <Link
                        to={`/courses/lessons/${activeLesson.id}/quiz`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2.5 transition-all"
                      >
                        Take Lesson Quiz
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}

                  {/* Course Assignments List */}
                  <div>
                    <h3 className="font-bold text-sm text-text-main  mb-4">Course Assignments</h3>
                    {assignments.length > 0 ? (
                      <div className="space-y-4">
                        {assignments.map(asg => (
                          <div 
                            key={asg.id}
                            className="p-5 border border-accent/20 bg-bg-main rounded-2xl dark:border-accent/20  space-y-4 shadow-soft"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h4 className="font-bold text-sm text-text-main ">{asg.title}</h4>
                                <p className="text-xs text-text-secondary  mt-1">{asg.description}</p>
                              </div>
                              <span className="text-[10px] bg-bg-secondary text-slate-655 font-bold px-2 py-0.5 rounded-md  ">
                                Due: {new Date(asg.due_date).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Resource File link if instructor added one */}
                            {asg.file_url && (
                              <a 
                                href={asg.file_url} 
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline "
                              >
                                <FileText className="w-4 h-4" />
                                Download PDF Handout
                              </a>
                            )}

                            {/* Submission Record status */}
                            {asg.submission ? (
                              <div className="bg-bg-secondary  p-4 rounded-xl border border-accent/30/50 dark:border-accent/20 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-text-secondary">Submission Status:</span>
                                  <span className={`font-bold ${
                                    asg.submission.grade 
                                      ? 'text-primary dark:text-emerald-400' 
                                      : 'text-primary dark:text-amber-500'
                                  }`}>
                                    {asg.submission.grade ? `Graded: ${asg.submission.grade}` : 'Pending Grading'}
                                  </span>
                                </div>
                                {asg.submission.feedback && (
                                  <p className="text-xs text-slate-655  leading-normal">
                                    <span className="font-semibold block text-text-secondary ">Instructor Feedback:</span>
                                    {asg.submission.feedback}
                                  </p>
                                )}
                              </div>
                            ) : (
                              /* Submission Form */
                              <div>
                                {submittingAsg === asg.id ? (
                                  <form onSubmit={handleUploadAssignment} className="flex flex-col gap-3">
                                    <label className="text-xs text-text-secondary">Upload Project Submission (ZIP, PDF, JS):</label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="file"
                                        onChange={(e) => setUploadFile(e.target.files[0])}
                                        required
                                        className="text-xs text-text-secondary  file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-bg-secondary file:text-text-secondary hover:file:bg-slate-200"
                                      />
                                      <button
                                        type="submit"
                                        className="rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs px-3.5 py-2 transition-all"
                                      >
                                        Upload
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setSubmittingAsg(null)}
                                        className="text-xs text-text-secondary hover:text-slate-750 px-2 py-2"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <button
                                    onClick={() => setSubmittingAsg(asg.id)}
                                    className="rounded-xl bg-bg-secondary hover:bg-accent/10 hover:text-primary text-text-secondary font-bold text-xs px-4 py-2.5 transition-colors"
                                  >
                                    Submit Assignment
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No projects specified for this course syllabus.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

          </div>

          {/* Right Column: Dynamic Course Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-accent/20 bg-bg-main p-5 shadow-soft dark:border-accent/20 ">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-sm text-text-main ">Course Curriculum</h3>
                <span className="text-xs font-semibold text-text-secondary">{progress}% Done</span>
              </div>
              <div className="h-1.5 w-full bg-bg-secondary rounded-full  overflow-hidden mb-6">
                <div className="h-full bg-primary rounded-full" style={{ width: `₹{progress}%` }} />
              </div>

              <div className="space-y-2">
                {lessons.map((lesson, idx) => {
                  const isActive = activeLessonIdx === idx;
                  const isCompleted = completedLessons.includes(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => setActiveLessonIdx(idx)}
                      className={`flex justify-between items-center p-3.5 rounded-2xl cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-accent/10/50 border-primary/20 text-primary-hover dark:bg-indigo-950/20 dark:border-indigo-850 '
                          : 'bg-bg-main border-transparent hover:bg-bg-secondary  '
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent resetting active video
                            toggleLessonComplete(lesson.id, isCompleted);
                          }}
                          className={`shrink-0 ${
                            isCompleted ? 'text-emerald-500' : 'text-slate-300 dark:text-text-secondary'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5 fill-current bg-bg-main rounded-full " />
                        </button>
                        <div className="text-left">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Lesson {idx + 1}</span>
                          <span className={`text-xs font-bold leading-snug line-clamp-1 ${
                            isActive ? 'text-primary-hover ' : 'text-text-secondary '
                          }`}>
                            {lesson.title}
                          </span>
                        </div>
                      </div>
                      
                      <span className="text-[10px] text-slate-400 dark:text-text-secondary">{lesson.duration}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </main>
      <Footer />
    </div>
  );
}
