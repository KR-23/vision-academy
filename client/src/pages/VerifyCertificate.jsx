import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Award, ShieldCheck, ShieldAlert, ArrowLeft, Loader2, Calendar, User, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyCertificate() {
  const { certificateNumber } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (certificateNumber) {
      verifyCode(certificateNumber);
    } else {
      setLoading(false);
    }
  }, [certificateNumber]);

  async function verifyCode(code) {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get(`/certificates/verify/${code}`);
      setCert(data.certificate);
    } catch (err) {
      setError(err.message || 'Verification failed. Certificate not found.');
      setCert(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-secondary  transition-colors">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >
          {/* Back link */}
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-main ">
              <ArrowLeft className="w-4.5 h-4.5" />
              Go to Home Page
            </Link>
          </div>

          <div className="glass p-8 rounded-3xl bg-bg-main  shadow-soft border border-accent/20 dark:border-accent/20">
            <div className="text-center mb-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-primary mb-4  ">
                <Award className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-extrabold text-text-main ">Credential Verification</h1>
              <p className="mt-1.5 text-sm text-text-secondary">Verify the authenticity of credentials issued by Vision Academy.</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-xs text-text-secondary mt-2">Checking registry records...</span>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-rose-500 mb-4 dark:bg-rose-950/20 dark:text-rose-455">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-text-main ">Invalid Certificate</h3>
                <p className="text-sm text-text-secondary mt-2 mb-6">{error}</p>
                <div className="text-xs text-slate-400 bg-bg-secondary  p-3 rounded-xl">
                  Verification Code: <span className="font-mono font-semibold">{certificateNumber}</span>
                </div>
              </div>
            ) : cert ? (
              <div className="space-y-6">
                {/* Successful validation badge */}
                <div className="flex items-center gap-3 bg-accent/10 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-4 rounded-2xl text-emerald-800 dark:text-emerald-350">
                  <ShieldCheck className="w-6 h-6 text-primary dark:text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold leading-tight">Credential Verified</h4>
                    <p className="text-xs text-primary/90 dark:text-emerald-400/90 mt-0.5">This certificate is an authentic and registered achievement record.</p>
                  </div>
                </div>

                {/* Details list */}
                <div className="border border-accent/20 rounded-2xl p-6 dark:border-accent/20 space-y-4 bg-bg-secondary/50 /50">
                  {/* Recipient */}
                  <div className="flex gap-3">
                    <User className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Recipient Student</span>
                      <span className="text-sm font-bold text-text-main ">{cert.student_name}</span>
                    </div>
                  </div>

                  {/* Course Name */}
                  <div className="flex gap-3">
                    <BookOpen className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Course Title</span>
                      <span className="text-sm font-bold text-primary  leading-snug block">{cert.course_name}</span>
                      <span className="text-xs text-text-secondary">Instructed by {cert.instructor_name}</span>
                    </div>
                  </div>

                  {/* Issue Date */}
                  <div className="flex gap-3">
                    <Calendar className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Issued On</span>
                      <span className="text-sm font-bold text-text-main ">{new Date(cert.issued_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider block">
                    Credential Serial ID: {cert.certificate_number}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-text-secondary mb-4">No certificate ID detected in the URL. Please verify your certificate link.</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
