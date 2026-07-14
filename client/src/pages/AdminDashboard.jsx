import React, { useEffect, useState } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { 
  Users, BookOpen, ShieldCheck, IndianRupee, UserCheck, 
  Settings, CheckCircle2, AlertTriangle, Trash2, Check 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    try {
      const { data } = await API.get('/analytics/admin');
      setData(data);
    } catch (err) {
      console.error(err);
      toast('Failed to load administrative analytics', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleApproveInstructor = async (instructorId) => {
    try {
      const { data: res } = await API.post('/analytics/admin/approve-instructor', { instructorId });
      toast(res.message, 'success');
      fetchAdminData(); // reload
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course from the platform?')) return;
    try {
      await API.delete(`/courses/${courseId}`);
      toast('Course deleted successfully', 'info');
      fetchAdminData();
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
      <Sidebar role="admin" />

      {/* Main Container */}
      <div className="md:pl-64 pt-6 min-h-[calc(100vh-4rem)]">
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-905 ">Admin Control Center</h1>
            <p className="mt-1 text-sm text-text-secondary font-medium">Verify instructor credentials, manage course catalogs, and track platform revenue.</p>
          </div>

          {/* Stats Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Students */}
            <div className="glass p-6 rounded-2xl bg-bg-main  shadow-soft">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Total Students</span>
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="text-2xl font-extrabold text-text-main ">{data?.stats.totalStudents || 0}</span>
            </div>

            {/* Instructors */}
            <div className="glass p-6 rounded-2xl bg-bg-main  shadow-soft">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Instructors</span>
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <span className="text-2xl font-extrabold text-slate-955 ">{data?.stats.totalInstructors || 0}</span>
            </div>

            {/* Courses */}
            <div className="glass p-6 rounded-2xl bg-bg-main  shadow-soft">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Courses</span>
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <span className="text-2xl font-extrabold text-slate-955 ">{data?.stats.totalCourses || 0}</span>
            </div>

            {/* Platform Revenue */}
            <div className="glass p-6 rounded-2xl bg-bg-main shadow-soft">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Platform Revenue</span>
                <IndianRupee className="w-5 h-5 text-primary" />
              </div>
              <span className="text-2xl font-extrabold text-text-main">₹{data?.stats.platformRevenue ? data.stats.platformRevenue.toFixed(2) : '0.00'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Columns: Course Management Catalog */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass p-6 rounded-2xl bg-bg-main  shadow-soft">
                <h3 className="font-extrabold text-sm text-text-main  mb-6">Manage Courses Catalog</h3>
                {data?.courses && data.courses.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.courses.map((course) => (
                      <div key={course.id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0 gap-4">
                        <div>
                          <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">{course.category}</span>
                          <h4 className="font-bold text-sm text-text-main  mt-0.5 line-clamp-1">{course.title}</h4>
                          <p className="text-xs text-text-secondary">Instructor: {course.instructor_name} | Price: ${course.price}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-2 border border-accent/30 text-slate-400 hover:text-rose-500 rounded-xl dark:border-accent/20 hover:bg-bg-secondary transition-all"
                            title="Delete course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No courses uploaded on platform yet.</p>
                )}
              </div>
            </div>

            {/* Right Column: Instructor Approvals queue */}
            <div className="lg:col-span-1">
              <div className="glass p-6 rounded-2xl bg-bg-main  shadow-soft">
                <h3 className="font-extrabold text-sm text-text-main  mb-6 flex items-center gap-2">
                  <UserCheck className="w-4.5 h-4.5 text-primary" />
                  Approve Instructors
                </h3>
                {data?.pendingInstructors && data.pendingInstructors.length > 0 ? (
                  <div className="space-y-4">
                    {data.pendingInstructors.map((inst) => (
                      <div 
                        key={inst.id}
                        className="p-4 rounded-xl border border-accent/20 dark:border-accent/20 flex items-center justify-between gap-3 bg-bg-secondary/50 "
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={inst.avatar} className="w-8 h-8 rounded-full" />
                          <div>
                            <span className="text-xs font-bold text-slate-850  leading-tight block">{inst.name}</span>
                            <span className="text-[10px] text-slate-400">{inst.email}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleApproveInstructor(inst.id)}
                          className="p-2 bg-accent/10 border border-primary/30 text-primary hover:bg-indigo-655 hover:text-white rounded-xl dark:bg-indigo-950/20 dark:border-indigo-900  transition-all shrink-0 cursor-pointer"
                          title="Approve instructor"
                        >
                          <Check className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No pending instructor profiles await vetting approval.</p>
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
