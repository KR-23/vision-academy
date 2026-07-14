import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Award, QrCode, Download, Eye, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentCertificates() {
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCert, setActiveCert] = useState(null); // The certificate currently viewed in the modal
  const [fetchingCert, setFetchingCert] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompleted();
  }, []);

  async function fetchCompleted() {
    try {
      const { data } = await API.get('/analytics/student');
      // Filter courses where progress is 100%
      const completed = data.enrolledCourses.filter(c => c.progress === 100);
      setCompletedCourses(completed);
    } catch (err) {
      console.error('Failed to fetch certificates:', err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleViewCertificate = async (courseId) => {
    setFetchingCert(true);
    try {
      const { data } = await API.get(`/certificates/courses/${courseId}`);
      setActiveCert(data.certificate);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setFetchingCert(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-bg-secondary  transition-colors print:bg-bg-main print:p-0">
      <div className="print:hidden">
        <Navbar />
        <Sidebar role="student" />
      </div>

      <div className="md:pl-64 pt-6 min-h-[calc(100vh-4rem)] print:pl-0 print:pt-0">
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 print:p-0">
          
          <div className="mb-8 print:hidden">
            <h1 className="text-3xl font-extrabold text-text-main  flex items-center gap-2">
              <Award className="w-8 h-8 text-primary" />
              My Certificates
            </h1>
            <p className="mt-1.5 text-sm text-text-secondary">View and download your completed course credentials and verify them publicly.</p>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse print:hidden">
              {[1].map(n => (
                <div key={n} className="h-28 rounded-2xl bg-bg-main  border border-accent/30 dark:border-accent/20" />
              ))}
            </div>
          ) : completedCourses.length > 0 ? (
            <div className="flex flex-col gap-4 print:hidden">
              {completedCourses.map((course) => (
                <div 
                  key={course.course_id}
                  className="glass flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl bg-bg-main hover:shadow-soft transition-all "
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-accent/10 text-primary rounded-xl  ">
                      <Award className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-text-main  leading-snug">{course.title}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">Instructed by {course.instructor_name}</p>
                      <span className="text-[10px] bg-accent/10 text-emerald-700 font-semibold px-2 py-0.5 rounded-lg border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40 mt-2 inline-block">
                        Course Completed
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewCertificate(course.course_id)}
                    disabled={fetchingCert}
                    className="mt-4 sm:mt-0 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {fetchingCert ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        View Certificate
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-accent/30 rounded-2xl p-12 text-center dark:border-accent/20 bg-bg-main  print:hidden">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-text-secondary ">No certificates earned yet</p>
              <p className="text-xs text-text-secondary mt-1 mb-4">Complete 100% of any enrolled course curriculum to unlock your certificate.</p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-bold text-white bg-primary px-4 py-2 rounded-xl"
              >
                Go to Courses
              </Link>
            </div>
          )}

          {/* PRINT-ISOLATED CERTIFICATE CONTAINER (Hidden by standard CSS, shown in print) */}
          {activeCert && (
            <div className="hidden print:block w-full max-w-[800px] mx-auto p-12 bg-accent/10/25 border-[16px] border-double border-amber-800 rounded-3xl relative text-center">
              <span className="font-serif text-3xl font-extrabold text-amber-800 tracking-wider block mb-2">CERTIFICATE OF COMPLETION</span>
              <span className="text-xs tracking-widest text-slate-400 uppercase font-semibold block mb-8">This credential validates that</span>
              
              <span className="font-serif text-4xl font-extrabold text-text-main border-b border-dashed border-slate-300 pb-2 px-10 inline-block mb-6">
                {activeCert.student_name}
              </span>
              
              <p className="text-sm text-slate-655 max-w-xl mx-auto leading-relaxed mb-6">
                has successfully finished the comprehensive syllabus curriculum and passed all technical examinations for the course
              </p>

              <span className="text-2xl font-extrabold text-primary block mb-2">{activeCert.course_name}</span>
              <span className="text-xs text-text-secondary block mb-8">Instructed by {activeCert.instructor_name}</span>

              <div className="flex justify-between items-center mt-12 border-t border-accent/30/80 pt-6">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Issue Date</span>
                  <span className="text-xs font-bold text-slate-805">{new Date(activeCert.issued_at).toLocaleDateString()}</span>
                </div>

                {/* QR Code link */}
                <div className="flex flex-col items-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${window.location.origin}/verify/${activeCert.certificate_number}`}
                    alt="Verification QR"
                    className="w-16 h-16 border border-accent/30 bg-bg-main p-1 rounded-lg"
                  />
                  <span className="text-[9px] text-slate-400 mt-1 font-mono">{activeCert.certificate_number}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Official Seal</span>
                  <span className="text-xs font-serif font-extrabold text-amber-700 block">Vision Academy</span>
                </div>
              </div>
            </div>
          )}

          {/* Certificate Modal (Desktop Overlay) */}
          <AnimatePresence>
            {activeCert && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm print:hidden">
                {/* Dismiss backdrop */}
                <div className="absolute inset-0" onClick={() => setActiveCert(null)} />

                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 30 }}
                  className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl bg-bg-main p-6  shadow-2xl border border-accent/20 dark:border-accent/20"
                >
                  {/* Header controls */}
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-sm text-text-main ">Credentials Preview</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 rounded-xl border border-accent/30 bg-bg-main hover:bg-bg-secondary text-text-secondary font-semibold text-xs px-3.5 py-2.5 dark:border-accent/20   dark:hover:bg-slate-750 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Print / Save PDF
                      </button>
                      <button
                        onClick={() => setActiveCert(null)}
                        className="rounded-xl bg-bg-secondary hover:bg-slate-200 text-text-secondary font-bold text-xs px-3.5 py-2.5   dark:hover:bg-slate-750 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Visual Certificate inside modal */}
                  <div className="w-full aspect-[4/3] max-w-[650px] mx-auto p-8 border-[12px] border-double border-amber-800 bg-accent/10/15 /20 rounded-2xl relative text-center flex flex-col justify-between">
                    <div>
                      <span className="font-serif text-xl font-extrabold text-amber-805 tracking-wider block mb-1">CERTIFICATE OF COMPLETION</span>
                      <span className="text-[9px] tracking-widest text-slate-400 dark:text-text-secondary uppercase font-bold block mb-4">This credential validates that</span>
                      
                      <span className="font-serif text-2xl font-extrabold text-text-main border-b border-dashed border-slate-300 pb-1 px-8 inline-block mb-3  dark:border-accent/20">
                        {activeCert.student_name}
                      </span>
                      
                      <p className="text-[11px] text-text-secondary  max-w-sm mx-auto leading-relaxed">
                        has successfully finished the comprehensive syllabus curriculum and passed all technical examinations for the course
                      </p>
                    </div>

                    <div className="my-2">
                      <span className="text-lg font-extrabold text-primary  block mb-0.5">{activeCert.course_name}</span>
                      <span className="text-[10px] text-slate-455 dark:text-slate-555 block">Instructed by {activeCert.instructor_name}</span>
                    </div>

                    <div className="flex justify-between items-center border-t border-accent/30/80 pt-4 dark:border-accent/20">
                      <div className="text-left">
                        <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider block">Issue Date</span>
                        <span className="text-[10px] font-bold text-slate-805 ">{new Date(activeCert.issued_at).toLocaleDateString()}</span>
                      </div>

                      {/* QR Code link */}
                      <div className="flex flex-col items-center">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${window.location.origin}/verify/${activeCert.certificate_number}`}
                          alt="Verification QR"
                          className="w-12 h-12 border border-accent/30 bg-bg-main p-0.5 rounded-md"
                        />
                        <span className="text-[8px] text-slate-400 mt-1 font-mono tracking-tighter">{activeCert.certificate_number}</span>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider block">Official Seal</span>
                        <span className="text-[10px] font-serif font-bold text-amber-700 block">Vision Academy</span>
                      </div>
                    </div>
                  </div>

                  {/* Public Link reminder */}
                  <div className="mt-4 text-center">
                    <Link
                      to={`/verify/${activeCert.certificate_number}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs text-primary  hover:underline"
                    >
                      Open public verification page
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </main>
      </div>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
