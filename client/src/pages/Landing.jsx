import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Sparkles, Code, Cpu, Palette, LineChart, Shield, Globe, 
  ArrowRight, ShieldCheck, Trophy, HelpCircle, Users, Star, Clock 
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Programming', icon: Code, color: 'text-primary bg-primary/10' },
  { name: 'AI', icon: Cpu, color: 'text-primary bg-primary/10' },
  { name: 'Design', icon: Palette, color: 'text-primary bg-primary/10' },
  { name: 'Business', icon: LineChart, color: 'text-primary bg-primary/10' },
  { name: 'Cyber Security', icon: Shield, color: 'text-primary bg-primary/10' },
  { name: 'Web Development', icon: Globe, color: 'text-primary bg-primary/10' }
];

export default function Landing() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopular() {
      try {
        const { data } = await API.get('/courses?sort=popular');
        setCourses(data.courses.slice(0, 3));
      } catch (err) {
        console.error('Error loading popular courses:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPopular();
  }, []);

  return (
    <div className="min-h-screen bg-bg-secondary  transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Soft floating background blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-200/40  rounded-full blur-3xl -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-cyan-200/30 dark:bg-cyan-900/10 rounded-full blur-2xl -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <span className="flex items-center gap-2 rounded-full border border-primary/30 bg-accent/10/50 px-4 py-1.5 text-xs font-semibold text-primary dark:border-primary/30  ">
              <Sparkles className="w-3.5 h-3.5" />
              The Future of Interactive Learning
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-3xl font-sans text-4xl font-extrabold tracking-tight text-text-main sm:text-6xl  leading-[1.1]"
          >
            Learn Anything.<br />
            <span className="text-primary">Anywhere. Anytime.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary leading-relaxed "
          >
            Vision is a premium, cohort-driven learning platform designed for ambitious builders. Complete interactive lessons, challenge yourself with quizzes, and earn authenticated blockchain-grade certificates.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link
              to="/courses"
              className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/10 hover:bg-primary-hover dark:shadow-none transition-all"
            >
              Explore Courses
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/signup?role=instructor"
              className="rounded-xl border border-accent/30 bg-bg-main px-6 py-3.5 text-sm font-semibold text-text-secondary hover:bg-bg-secondary dark:border-accent/20    transition-colors"
            >
              Become Instructor
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-text-main ">Top Learning Categories</h2>
            <p className="mt-2 text-sm text-text-secondary ">Choose from targeted, industry-vetted engineering tracks.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.8, type: "spring", stiffness: 50, delay: idx * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="glass flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer hover:shadow-soft transition-all text-center /50"
                  onClick={() => navigate(`/courses?category=${cat.name}`)}
                >
                  <div className={`p-3.5 rounded-xl ${cat.color} mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-text-main dark:text-slate-250">{cat.name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-16 bg-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-text-main ">Explore Popular Courses</h2>
              <p className="mt-2 text-sm text-text-secondary ">Join thousands of students learning modern software crafts.</p>
            </div>
            <Link
              to="/courses"
              className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover "
            >
              View all courses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-96 rounded-2xl border border-accent/20 bg-bg-main animate-pulse dark:border-accent/20 " />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.9, type: "spring", stiffness: 45, delay: idx * 0.12 }}
                  whileHover={{ y: -5 }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-accent/20 bg-bg-main shadow-soft hover:shadow-md dark:border-accent/20/80 "
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-bg-secondary">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 rounded-lg bg-bg-main/90 backdrop-blur-md border border-accent/30/50 px-2.5 py-1 text-xs font-semibold text-primary /85 dark:border-accent/20 ">
                      {course.category}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-2 ">
                      <span>{course.difficulty}</span>
                      <span>•</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span className="font-semibold text-text-secondary ">{Number(course.rating || 4.5).toFixed(1)}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-text-main group-hover:text-primary transition-colors line-clamp-2  dark:group-hover:text-primary">
                      <Link to={`/courses/${course.id}`}>
                        {course.title}
                      </Link>
                    </h3>

                    <p className="mt-2 flex-1 text-sm text-text-secondary line-clamp-2 ">
                      {course.description}
                    </p>

                    {/* Metadata Footer */}
                    <div className="mt-6 flex items-center justify-between border-t border-accent/20 pt-4 dark:border-accent/20">
                      <span className="text-sm font-medium text-slate-655  truncate">
                        By {course.instructor_name}
                      </span>
                      <span className="text-base font-bold text-text-main ">
                        {course.price > 0 ? `₹${course.price}` : 'Free'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-transparent transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-text-main ">Designed For Builders</h2>
            <p className="mt-2 text-sm text-text-secondary ">Learn directly through exercises, code bookmarks, and tests.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, type: "spring", stiffness: 45 }}
              className="flex gap-4 p-6 rounded-2xl border border-accent/20 bg-bg-main shadow-soft"
            >
              <div className="p-3 bg-primary/10 rounded-xl text-primary h-fit">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-text-main mb-1">Authentic Certificates</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Earn detailed digital credentials containing unique public QR verification codes upon finishing curriculum timelines.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, type: "spring", stiffness: 45, delay: 0.15 }}
              className="flex gap-4 p-6 rounded-2xl border border-accent/20 bg-bg-main shadow-soft"
            >
              <div className="p-3 bg-primary/10 rounded-xl text-primary h-fit">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-text-main mb-1">Gamified Milestones</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Accumulate learning XP, progress through active daily streaks, and unlock achievements for passing quiz evaluations.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, type: "spring", stiffness: 45, delay: 0.3 }}
              className="flex gap-4 p-6 rounded-2xl border border-accent/20 bg-bg-main shadow-soft"
            >
              <div className="p-3 bg-primary/10 rounded-xl text-primary h-fit">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-text-main mb-1">Interactive Forums</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Ask questions, exchange project codes, and get verified answers stamped by course instructors directly.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Student Testimonials */}
      <section className="py-20 bg-transparent transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-text-main ">Trusted by Thousands</h2>
            <p className="mt-2 text-sm text-text-secondary ">See how students accelerated their technology careers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, type: "spring", stiffness: 45 }}
              className="glass p-6 rounded-2xl bg-bg-main /50"
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://api.dicebear.com/7.x/adventurer/svg?seed=emma"
                  alt="Emma"
                  className="w-10 h-10 rounded-full bg-accent/10"
                />
                <div>
                  <h4 className="font-bold text-sm text-text-main ">Emma Watson</h4>
                  <p className="text-xs text-text-secondary">Frontend Engineer at Linear</p>
                </div>
              </div>
              <p className="text-sm text-slate-655  leading-relaxed italic">
                "The React curriculum was extremely thorough. The quiz leaderboards and clean workspace structure kept me motivated daily."
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, type: "spring", stiffness: 45, delay: 0.15 }}
              className="glass p-6 rounded-2xl bg-bg-main /50"
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://api.dicebear.com/7.x/adventurer/svg?seed=marcus"
                  alt="Marcus"
                  className="w-10 h-10 rounded-full bg-accent/10"
                />
                <div>
                  <h4 className="font-bold text-sm text-text-main ">Marcus Aurelius</h4>
                  <p className="text-xs text-text-secondary">Software Developer</p>
                </div>
              </div>
              <p className="text-sm text-slate-655  leading-relaxed italic">
                "Earning the verified certificate was a game-changer. I shared my certificate link on my portfolio, and hiring managers loved the QR code check."
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, type: "spring", stiffness: 45, delay: 0.3 }}
              className="glass p-6 rounded-2xl bg-bg-main /50"
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://api.dicebear.com/7.x/adventurer/svg?seed=sophia"
                  alt="Sophia"
                  className="w-10 h-10 rounded-full bg-accent/10"
                />
                <div>
                  <h4 className="font-bold text-sm text-text-main ">Sophia Chen</h4>
                  <p className="text-xs text-text-secondary">ML Specialist</p>
                </div>
              </div>
              <p className="text-sm text-slate-655  leading-relaxed italic">
                "The server architecture lesson using PostgreSQL SQLite fallbacks matched production patterns. Excellent visual tools and quizzes."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
