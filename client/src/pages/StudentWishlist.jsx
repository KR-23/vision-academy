import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Heart, Trash2, BookOpen, Star } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function StudentWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function fetchWishlist() {
    try {
      const { data } = await API.get('/courses/student/wishlist');
      setWishlist(data.wishlist);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const removeWish = async (courseId) => {
    try {
      const { data } = await API.post('/courses/student/wishlist', { courseId });
      setWishlist(prev => prev.filter(c => c.id !== courseId));
      toast(data.message, 'info');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary  transition-colors">
      <Navbar />
      <Sidebar role="student" />

      <div className="md:pl-64 pt-6 min-h-[calc(100vh-4rem)]">
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-text-main ">My Wishlist</h1>
            <p className="mt-1.5 text-sm text-text-secondary">Manage courses you are tracking for future purchase or enrollment.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2].map((n) => (
                <div key={n} className="h-60 rounded-2xl bg-bg-main  border border-accent/30 dark:border-accent/20" />
              ))}
            </div>
          ) : wishlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {wishlist.map((course) => (
                <div
                  key={course.id}
                  className="glass flex flex-col justify-between overflow-hidden rounded-2xl border border-accent/20 bg-bg-main p-5 shadow-soft hover:shadow-md dark:border-accent/20  transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-2.5">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                        {course.category}
                      </span>
                      <button 
                        onClick={() => removeWish(course.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h3 className="font-bold text-base text-text-main  leading-snug line-clamp-2 hover:text-primary transition-colors">
                      <Link to={`/courses/${course.id}`}>
                        {course.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-555 mt-1 ">
                      By {course.instructor_name}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-accent/20 pt-4 dark:border-accent/20">
                    <span className="text-base font-extrabold text-text-main ">
                      {course.price > 0 ? `₹${course.price}` : 'Free'}
                    </span>
                    <Link
                      to={`/courses/${course.id}`}
                      className="flex items-center gap-1 text-xs font-semibold text-white bg-primary hover:bg-primary-hover px-3.5 py-2 rounded-xl transition-all"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-accent/30 rounded-2xl p-12 text-center dark:border-accent/20 bg-bg-main ">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-text-secondary ">Your wishlist is empty</p>
              <p className="text-xs text-text-secondary mt-1 mb-4">Saved courses will appear here.</p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-1 text-xs font-bold text-white bg-primary px-4 py-2 rounded-xl"
              >
                Find Courses
              </Link>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
