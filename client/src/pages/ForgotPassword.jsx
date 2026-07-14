import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const [submitting, setSubmitting] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await API.post('/auth/forgot-password', { email: data.email });
      setSuccessMsg(res.data.message);
      setResetCode(res.data.resetCode);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-secondary  transition-colors">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="glass p-8 rounded-2xl bg-bg-main  shadow-soft">
            <div className="mb-6">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-main ">
                <ArrowLeft className="w-4.5 h-4.5" />
                Back to Sign In
              </Link>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-text-main ">Forgot Password</h2>
              <p className="mt-2 text-sm text-text-secondary ">
                Enter your email address to receive password reset details.
              </p>
            </div>

            {successMsg ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-primary mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-805  mb-2">{successMsg}</p>
                <div className="bg-bg-secondary /80 p-4 rounded-xl border border-accent/30 dark:border-slate-700 my-4 text-center">
                  <span className="text-xs text-slate-400 dark:text-text-secondary uppercase font-semibold block tracking-wider mb-1">
                    Mock Reset OTP
                  </span>
                  <span className="text-2xl font-extrabold tracking-widest text-primary ">
                    {resetCode}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Since this is a portfolio environment, copy this code and input it into your reset workflows.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary  mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail className="w-5 h-5" />
                    </span>
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Please enter a valid email address'
                        }
                      })}
                      placeholder="name@example.com"
                      className={`w-full rounded-xl border pl-10 pr-4 py-2.5 bg-bg-secondary  border-accent/30 dark:border-accent/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                        errors.email ? 'border-rose-455 focus:ring-rose-500/20 focus:border-rose-500' : ''
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/10 hover:bg-primary-hover disabled:opacity-60 transition-all cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending instructions...
                    </>
                  ) : (
                    'Send Instructions'
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
