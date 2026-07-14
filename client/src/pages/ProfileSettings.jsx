import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { User, Mail, Lock, Check, Loader2, Award } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const AVATAR_SEEDS = ['Emma', 'Jack', 'Mia', 'Oliver', 'Sophia', 'Lucas', 'Charlotte', 'Noah'];

export default function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setSubmitting(false);
    const updateData = { name: data.name, email: data.email, avatar: selectedAvatar };
    if (data.password) {
      updateData.password = data.password;
    }

    setSubmitting(true);
    try {
      await updateProfile(updateData);
      reset({ name: data.name, email: data.email, password: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getSidebarRole = () => {
    return user?.role === 'admin' ? 'admin' : user?.role === 'instructor' ? 'instructor' : 'student';
  };

  return (
    <div className="min-h-screen bg-bg-secondary  transition-colors">
      <Navbar />
      <Sidebar role={getSidebarRole()} />

      <div className="md:pl-64 pt-6 min-h-[calc(100vh-4rem)]">
        <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-text-main ">Profile Settings</h1>
            <p className="mt-1 text-sm text-slate-550">Update your account username, avatars, and security credentials.</p>
          </div>

          <div className="glass p-8 rounded-2xl bg-bg-main  shadow-soft">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Avatar Selector */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary  mb-3">
                  Choose Avatar Seed
                </label>
                <div className="flex flex-wrap gap-3">
                  {AVATAR_SEEDS.map((seed) => {
                    const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
                    const isSelected = selectedAvatar === url;
                    return (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => setSelectedAvatar(url)}
                        className={`relative w-12 h-12 rounded-full border bg-bg-secondary p-0.5 overflow-hidden transition-all dark:border-accent/20 ${
                          isSelected ? 'ring-2 ring-indigo-650 scale-105 border-primary' : 'hover:scale-103'
                        }`}
                      >
                        <img src={url} alt={seed} className="w-full h-full object-cover" />
                        {isSelected && (
                          <span className="absolute inset-0 bg-primary/40 flex items-center justify-center text-white">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary  mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full rounded-xl border border-slate-205 pl-10 pr-4 py-2.5 bg-bg-secondary dark:border-accent/20   text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs font-medium text-rose-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
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
                        message: 'Enter a valid email'
                      }
                    })}
                    className="w-full rounded-xl border border-slate-205 pl-10 pr-4 py-2.5 bg-bg-secondary dark:border-accent/20   text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary  mb-1.5">
                  Reset Password (Leave blank to keep current)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type="password"
                    {...register('password', {
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-205 pl-10 pr-4 py-2.5 bg-bg-secondary dark:border-accent/20   text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Profile...
                  </>
                ) : (
                  'Save Profile Details'
                )}
              </button>

            </form>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
