import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Trophy, Flame, Star, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_LEADERBOARD = [
  { name: 'Sarah Connor', role: 'student', xp: 2850, streak: 21, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=sarah_connor' },
  { name: 'Bruce Wayne', role: 'student', xp: 2400, streak: 15, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=bruce' },
  { name: 'Tony Stark', role: 'student', xp: 2150, streak: 18, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=tony' },
  { name: 'Peter Parker', role: 'student', xp: 1800, streak: 9, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=peter' }
];

export default function StudentLeaderboard() {
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate a clean leaderboard merging the current user with other platform students
    if (user) {
      const userEntry = {
        name: user.name + ' (You)',
        role: 'student',
        xp: user.xp || 0,
        streak: user.streak || 0,
        avatar: user.avatar,
        isSelf: true
      };

      const fullList = [...MOCK_LEADERBOARD, userEntry]
        .sort((a, b) => b.xp - a.xp)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      setBoard(fullList);
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-bg-secondary  transition-colors">
      <Navbar />
      <Sidebar role="student" />

      <div className="md:pl-64 pt-6 min-h-[calc(100vh-4rem)]">
        <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-text-main  flex items-center justify-center sm:justify-start gap-2.5">
              <Trophy className="w-8 h-8 text-amber-500 fill-amber-500/20" />
              Global Leaderboard
            </h1>
            <p className="mt-1.5 text-sm text-text-secondary">Compete with builders worldwide. Earn XP by answering quizzes and finishing coursework.</p>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-16 rounded-2xl bg-bg-main  border border-accent/30 dark:border-accent/20" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Podium for top 3 */}
              <div className="grid grid-cols-3 gap-4 mb-6 items-end text-center">
                {/* 2nd place */}
                {board[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass bg-bg-main  p-4 rounded-2xl flex flex-col items-center border-t-4 border-t-slate-400"
                  >
                    <span className="text-xs font-bold text-slate-400">#2</span>
                    <img src={board[1].avatar} alt={board[1].name} className="w-12 h-12 rounded-full my-2 bg-bg-secondary " />
                    <h4 className="text-xs font-bold text-text-main  truncate max-w-full">{board[1].name}</h4>
                    <span className="text-xs font-semibold text-text-secondary mt-1">{board[1].xp} XP</span>
                  </motion.div>
                )}

                {/* 1st place */}
                {board[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass bg-bg-main  p-5 rounded-2xl flex flex-col items-center border-t-4 border-t-amber-500 scale-105 shadow-md relative"
                  >
                    <span className="absolute -top-3.5 bg-accent/100 text-white rounded-full p-1 border-2 border-white dark:border-slate-950">
                      <Sparkles className="w-4.5 h-4.5" />
                    </span>
                    <span className="text-sm font-bold text-amber-500">#1</span>
                    <img src={board[0].avatar} alt={board[0].name} className="w-14 h-14 rounded-full my-2 bg-bg-secondary " />
                    <h4 className="text-sm font-extrabold text-text-main  truncate max-w-full">{board[0].name}</h4>
                    <span className="text-xs font-bold text-primary  mt-1">{board[0].xp} XP</span>
                  </motion.div>
                )}

                {/* 3rd place */}
                {board[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass bg-bg-main  p-4 rounded-2xl flex flex-col items-center border-t-4 border-t-orange-400"
                  >
                    <span className="text-xs font-bold text-orange-555">#3</span>
                    <img src={board[2].avatar} alt={board[2].name} className="w-12 h-12 rounded-full my-2 bg-bg-secondary " />
                    <h4 className="text-xs font-bold text-text-main  truncate max-w-full">{board[2].name}</h4>
                    <span className="text-xs font-semibold text-text-secondary mt-1">{board[2].xp} XP</span>
                  </motion.div>
                )}
              </div>

              {/* Remainder list */}
              <div className="flex flex-col gap-2.5">
                {board.map((student) => (
                  <motion.div
                    key={student.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      student.isSelf
                        ? 'bg-accent/10/70 border-primary/30 dark:bg-indigo-950/20 dark:border-primary/30'
                        : 'bg-bg-main border-accent/20  dark:border-accent/20'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Position */}
                      <span className={`w-6 font-sans font-extrabold text-sm ${
                        student.rank === 1 ? 'text-amber-500' : student.rank === 2 ? 'text-slate-400' : student.rank === 3 ? 'text-orange-500' : 'text-text-secondary'
                      }`}>
                        #{student.rank}
                      </span>
                      {/* Avatar */}
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-10 h-10 rounded-full border border-accent/30/50 bg-bg-secondary shrink-0 object-cover dark:border-accent/20"
                      />
                      {/* Name */}
                      <div>
                        <span className={`text-sm font-bold block ${
                          student.isSelf ? 'text-primary-hover ' : 'text-text-main '
                        }`}>
                          {student.name}
                        </span>
                        <span className="text-[10px] text-text-secondary tracking-wider uppercase font-semibold">
                          Active Learner
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Streak */}
                      <div className="flex items-center gap-1 text-orange-655 font-bold text-xs" title="Streak count">
                        <Flame className="w-4.5 h-4.5 fill-orange-600 animate-pulse" />
                        <span>{student.streak}d</span>
                      </div>

                      {/* XP */}
                      <div className="flex items-center gap-1.5 text-primary font-bold text-sm " title="Total XP">
                        <Star className="w-4.5 h-4.5 fill-indigo-600 text-primary dark:fill-indigo-400 " />
                        <span>{student.xp}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
