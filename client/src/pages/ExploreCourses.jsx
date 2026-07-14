import React, { useEffect, useState } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Star, Filter, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ExploreCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [priceType, setPriceType] = useState('');
  const [sort, setSort] = useState('popular');

  useEffect(() => {
    fetchCourses();
  }, [category, difficulty, priceType, sort]);

  async function fetchCourses() {
    setLoading(true);
    try {
      let query = `?sort=${sort}`;
      if (category) query += `&category=${category}`;
      if (difficulty) query += `&difficulty=${difficulty}`;
      if (priceType) query += `&priceType=${priceType}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;

      const { data } = await API.get(`/courses${query}`);
      setCourses(data.courses);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="min-h-screen bg-bg-secondary  transition-colors">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-slate-905 ">Explore Courses</h1>
          <p className="mt-1 text-sm text-text-secondary">Upgrade your engineering toolkit with specialized, interactive programs.</p>
        </div>

        {/* Filter Toolbar */}
        <div className="glass p-5 rounded-2xl bg-bg-main  border border-accent/20 dark:border-accent/20 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses by keyword..."
                className="w-full rounded-xl border border-accent/30 pl-10 pr-4 py-2.5 text-sm bg-bg-secondary dark:border-accent/20   focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </form>

            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
              {/* Category */}
              <div className="flex items-center gap-1">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-xl border border-accent/30 bg-bg-main px-3.5 py-2.5 text-xs font-semibold text-slate-705 dark:border-accent/20   focus:outline-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  <option value="Programming">Programming</option>
                  <option value="AI">AI</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="Web Development">Web Development</option>
                </select>
              </div>

              {/* Difficulty */}
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="rounded-xl border border-accent/30 bg-bg-main px-3.5 py-2.5 text-xs font-semibold text-slate-705 dark:border-accent/20   focus:outline-none cursor-pointer"
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              {/* Price */}
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                className="rounded-xl border border-accent/30 bg-bg-main px-3.5 py-2.5 text-xs font-semibold text-slate-705 dark:border-accent/20   focus:outline-none cursor-pointer"
              >
                <option value="">Any Price</option>
                <option value="free">Free Only</option>
                <option value="paid">Paid Only</option>
              </select>

              {/* Sort Order */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-accent/30 bg-bg-main px-3.5 py-2.5 text-xs font-semibold text-slate-705 dark:border-accent/20   focus:outline-none cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-96 rounded-2xl bg-bg-main  border border-accent/30 dark:border-accent/20" />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ y: -5 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-accent/20 bg-bg-main shadow-soft hover:shadow-md dark:border-accent/20  transition-all"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-bg-secondary ">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300"
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
        ) : (
          <div className="border border-dashed border-accent/30 rounded-2xl p-16 text-center dark:border-accent/20 bg-bg-main ">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-text-secondary ">No courses match your query</p>
            <p className="text-xs text-text-secondary mt-1">Try resetting filters or checking your search keywords.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
