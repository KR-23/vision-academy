import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrolled();
  }, []);

  async function fetchEnrolled() {
    try {
      const { data } = await API.get('/analytics/student');
      setCourses(data.enrolledCourses);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-secondary  transition-colors">
      <Navbar />
      <Sidebar role="student" />

      <div className="md:pl-64 pt-6 min-h-[calc(100vh-4rem)]">
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-text-main ">My Learning</h1>
            <p className="mt-1.5 text-sm text-text-secondary font-medium">Pick up right where you left off in your courses.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[1, 2].map(n => (
                <div key={n} className="h-44 rounded-2xl bg-bg-main  border border-accent/30 dark:border-accent/20" />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course, idx) => (
                <motion.div
                  key={course.course_id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass flex flex-col sm:flex-row gap-5 p-5 rounded-2xl bg-bg-main hover:shadow-soft "
                >
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full sm:w-40 aspect-video rounded-xl object-cover bg-bg-secondary  shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 block mb-1">
                        {course.category}
                      </span>
                      <h3 className="font-bold text-sm text-text-main  leading-snug line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1">
                        By {course.instructor_name}
                      </p>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] font-bold text-text-secondary mb-1.5">
                        <span>Course Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-bg-secondary rounded-full  overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `₹{course.progress}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="self-end sm:self-center">
                    <Link
                      to={`/courses/${course.course_id}/player`}
                      className="flex items-center gap-1 bg-bg-secondary hover:bg-indigo-55 hover:text-primary border border-accent/30 dark:border-accent/20 text-text-secondary   dark:hover:bg-slate-750 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                    >
                      Resume
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-accent/30 rounded-2xl p-12 text-center dark:border-accent/20 bg-bg-main ">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-text-secondary ">You are not enrolled in any courses</p>
              <p className="text-xs text-text-secondary mt-1 mb-4">Start learning by choosing a track from our directory.</p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-1 text-xs font-bold text-white bg-primary px-4 py-2 rounded-xl"
              >
                Browse Catalog
              </Link>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
