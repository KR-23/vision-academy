import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Star, Clock, Globe, BarChart, Users, Heart, Play, 
  ChevronRight, Award, AlertCircle, CheckCircle2, Bookmark
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id, user]);

  async function fetchCourseDetails() {
    setLoading(true);
    try {
      const { data } = await API.get(`/courses/${id}`);
      setCourse(data.course);
      setLessons(data.lessons);
      setEnrolled(data.enrolled);
      setProgress(data.progress);
      setWishlisted(data.isWishlisted);
    } catch (err) {
      console.error(err);
      toast(err.message || 'Course not found', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleEnroll = async () => {
    if (!user) {
      navigate(`/login?redirect=/courses/${id}`);
      return;
    }
    
    setActionLoading(true);
    try {
      const { data } = await API.post(`/courses/${id}/enroll`);
      setEnrolled(true);
      toast(data.message, 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      navigate(`/login?redirect=/courses/${id}`);
      return;
    }

    try {
      const { data } = await API.post('/courses/student/wishlist', { courseId: course.id });
      setWishlisted(data.isWishlisted);
      toast(data.message, 'success');
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

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-secondary  transition-colors">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <AlertCircle className="w-12 h-12 text-slate-350 mx-auto mb-3" />
            <p className="text-sm font-semibold text-text-secondary dark:text-slate-355">Course not found</p>
            <Link to="/courses" className="text-xs text-primary hover:underline mt-2 inline-block">Back to Explore</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary  transition-colors">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Banner/Header Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-primary  block mb-3">
              {course.category}
            </span>
            <h1 className="text-3xl font-extrabold text-text-main sm:text-4xl  leading-tight">
              {course.title}
            </h1>
            <p className="mt-4 text-text-secondary  leading-relaxed text-base">
              {course.description}
            </p>

            {/* Meta Row */}
            <div className="mt-6 flex flex-wrap gap-5 items-center text-xs text-slate-550 ">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="font-bold text-text-main ">4.5</span>
                <span>(120 ratings)</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{course.student_count} Students Enrolled</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4 text-slate-400" />
                <span>Language: {course.language}</span>
              </div>
            </div>

            {/* Instructor Details */}
            <div className="mt-8 flex items-center gap-3 border-t border-accent/20 dark:border-accent/20 pt-6">
              <img
                src={course.instructor_avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${course.instructor_name}`}
                alt={course.instructor_name}
                className="w-10 h-10 rounded-full border bg-accent/10 shrink-0"
              />
              <div>
                <p className="text-xs text-slate-400">Instructed by</p>
                <p className="text-sm font-bold text-text-main ">{course.instructor_name}</p>
              </div>
            </div>

            {/* Curriculum/Syllabus */}
            <div className="mt-12">
              <h2 className="text-xl font-extrabold text-text-main  mb-6">Course Syllabus</h2>
              {lessons.length > 0 ? (
                <div className="border border-accent/20 rounded-2xl overflow-hidden bg-bg-main dark:border-accent/20 ">
                  {lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className={`flex justify-between items-center p-4 text-sm ${
                        idx < lessons.length - 1 ? 'border-b border-accent/20 dark:border-accent/20/80' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-bg-secondary  font-semibold text-xs text-text-secondary">
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="font-semibold text-slate-805 dark:text-slate-250 line-clamp-1">{lesson.title}</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-text-secondary shrink-0">{lesson.duration || '15 mins'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No lessons uploaded yet for this course.</p>
              )}
            </div>
          </div>

          {/* Sticky Sidebar (Purchase/Resume Card) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-accent/20 bg-bg-main p-6 shadow-soft dark:border-accent/20 ">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full aspect-video rounded-2xl object-cover bg-bg-secondary mb-6"
              />

              <div className="flex justify-between items-center mb-6">
                <span className="text-2xl font-extrabold text-text-main ">
                  {course.price > 0 ? `₹${course.price}` : 'Free'}
                </span>
                
                {/* Wishlist Button */}
                <button
                  onClick={handleWishlist}
                  className={`p-2.5 rounded-xl border border-accent/30 hover:bg-bg-secondary dark:border-accent/20  transition-colors ${
                    wishlisted ? 'text-rose-500 bg-accent/10 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900' : 'text-slate-400'
                  }`}
                  title="Save course"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>

              {/* Action Button */}
              {enrolled ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                    <span>Your progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-bg-secondary rounded-full  overflow-hidden mb-4">
                    <div className="h-full bg-accent/100 rounded-full" style={{ width: `₹{progress}%` }} />
                  </div>
                  <Link
                    to={`/courses/${course.id}/player`}
                    className="w-full flex justify-center items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm py-3 shadow-md shadow-primary/10 dark:shadow-none transition-all"
                  >
                    Resume Learning
                    <ChevronRight className="w-4.5 h-4.5" />
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={actionLoading}
                  className="w-full flex justify-center items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm py-3 shadow-md shadow-primary/10 dark:shadow-none transition-all cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    'Processing enrollment...'
                  ) : (
                    <>
                      Enroll Now
                      <ChevronRight className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              )}

              {/* Course Features list */}
              <div className="mt-6 border-t border-accent/20 pt-6 dark:border-accent/20 space-y-4">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">This Course Includes</h4>
                
                <div className="flex items-center gap-3 text-xs text-slate-655 ">
                  <Clock className="w-4.5 h-4.5 text-primary shrink-0" />
                  <span>Duration: {course.duration || '20 hours'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-655 ">
                  <BarChart className="w-4.5 h-4.5 text-primary shrink-0" />
                  <span>Level: {course.difficulty}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-655 ">
                  <Award className="w-4.5 h-4.5 text-primary shrink-0" />
                  <span>Verified Completion Certificate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
