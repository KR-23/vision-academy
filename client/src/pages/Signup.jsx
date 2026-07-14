import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Award, GraduationCap } from 'lucide-react';

export default function Signup() {
  const { register: signupAuth } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const [passwordValue, setPasswordValue] = useState('');
  const [pwdStrength, setPwdStrength] = useState({ score: 0, label: 'Very Weak', color: 'bg-accent/100' });

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const watchPassword = watch('password');

  // Monitor password changes to update strength meter
  useEffect(() => {
    if (!watchPassword) {
      setPwdStrength({ score: 0, label: 'Too Short', color: 'bg-slate-300' });
      return;
    }

    const val = watchPassword;
    let score = 0;

    if (val.length >= 6) score += 1;
    if (val.length >= 8) score += 1;
    if (/[A-Z]/.test(val)) score += 1;
    if (/[0-9]/.test(val)) score += 1;
    if (/[^A-Za-z0-9]/.test(val)) score += 1;

    let label = 'Very Weak';
    let color = 'bg-accent/100';

    if (score >= 4) {
      label = 'Strong';
      color = 'bg-accent/100';
    } else if (score >= 2) {
      label = 'Medium';
      color = 'bg-accent/100';
    }

    setPwdStrength({ score, label, color });
  }, [watchPassword]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await signupAuth(data.name, data.email, data.password, selectedRole);
      if (selectedRole === 'instructor') {
        // Redirect to homepage since they must wait for admin approval
        navigate('/');
      } else {
        navigate('/dashboard');
      }
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
          {/* Form Card */}
          <div className="glass p-8 rounded-2xl bg-bg-main  shadow-soft">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-text-main ">Create Account</h2>
              <p className="mt-2 text-sm text-text-secondary ">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary hover:text-primary ">
                  Sign in instead
                </Link>
              </p>
            </div>

            {/* Role Switcher */}
            <div className="flex gap-2 p-1 bg-bg-secondary rounded-xl mb-6 ">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedRole === 'student'
                    ? 'bg-bg-main text-text-main shadow-sm  '
                    : 'text-text-secondary hover:text-slate-850 '
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('instructor')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedRole === 'instructor'
                    ? 'bg-bg-main text-text-main shadow-sm  '
                    : 'text-text-secondary hover:text-slate-850 '
                }`}
              >
                <Award className="w-4 h-4" />
                Instructor
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary  mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    placeholder="John Doe"
                    className={`w-full rounded-xl border pl-10 pr-4 py-2.5 bg-bg-secondary  border-accent/30 dark:border-accent/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                      errors.name ? 'border-rose-455 focus:ring-rose-500/20' : ''
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs font-medium text-rose-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary  mb-1">
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
                    placeholder="john@example.com"
                    className={`w-full rounded-xl border pl-10 pr-4 py-2.5 bg-bg-secondary  border-accent/30 dark:border-accent/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                      errors.email ? 'border-rose-455 focus:ring-rose-500/20' : ''
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs font-medium text-rose-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary  mb-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    placeholder="••••••••"
                    className={`w-full rounded-xl border pl-10 pr-10 py-2.5 bg-bg-secondary  border-accent/30 dark:border-accent/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                      errors.password ? 'border-rose-455 focus:ring-rose-500/20' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-655"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs font-medium text-rose-500">{errors.password.message}</p>
                )}

                {/* Password Strength Meter */}
                {watchPassword && (
                  <div className="mt-2.5">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-text-secondary">Password Strength:</span>
                      <span className="font-semibold text-slate-750 ">{pwdStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-bg-secondary rounded-full  overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${pwdStrength.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `₹{(pwdStrength.score / 5) * 100}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary  mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type="password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (val) => val === watchPassword || 'Passwords do not match'
                    })}
                    placeholder="••••••••"
                    className={`w-full rounded-xl border pl-10 pr-4 py-2.5 bg-bg-secondary  border-accent/30 dark:border-accent/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                      errors.confirmPassword ? 'border-rose-455 focus:ring-rose-500/20' : ''
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs font-medium text-rose-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/10 hover:bg-primary-hover disabled:opacity-60 transition-all cursor-pointer mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
