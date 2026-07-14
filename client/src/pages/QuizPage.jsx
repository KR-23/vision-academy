import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Trophy, Star, ArrowRight, Loader2, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '../context/ToastContext';

export default function QuizPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionValue }
  const [currentQIdx, setCurrentQIdx] = useState(0);

  // States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null); // score, totalQuestions, review, leaderboard

  // Timer: 5 minutes (300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [lessonId]);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0 || results) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, timerActive, results]);

  async function fetchQuiz() {
    try {
      const { data } = await API.get(`/quizzes/lessons/${lessonId}`);
      setQuiz(data.quiz);
      setQuestions(data.questions);
    } catch (err) {
      toast(err.message || 'No quiz configured for this lesson.', 'warning');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectAnswer = (qId, option) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    setTimerActive(false);
    try {
      const { data } = await API.post('/quizzes/submit', {
        quizId: quiz.id,
        answers: selectedAnswers
      });
      
      setResults(data);
      toast(data.feedback, data.passed ? 'success' : 'warning');
      
      // Explode confetti if user passes!
      if (data.passed) {
        triggerConfetti();
      }
    } catch (err) {
      toast(err.message, 'error');
      setTimerActive(true); // resume timer if submit failed
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    toast('Time has expired! Automatically submitting your answers...', 'warning');
    handleSubmitQuiz();
  };

  const triggerConfetti = () => {
    // Canvas Confetti explosion
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#4F46E5', '#06B6D4', '#22C55E']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4F46E5', '#06B6D4', '#22C55E']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `₹{m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-secondary ">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent" />
      </div>
    );
  }

  const activeQuestion = questions[currentQIdx];

  return (
    <div className="min-h-screen flex flex-col bg-bg-secondary  transition-colors">
      <Navbar />

      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Results Screen */}
        {results ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Score Summary Card */}
            <div className="glass p-8 rounded-3xl bg-bg-main  shadow-soft text-center">
              <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 ${
                results.passed 
                  ? 'bg-accent/10 text-primary dark:bg-emerald-950/40 dark:text-emerald-400' 
                  : 'bg-accent/10 text-rose-500 dark:bg-rose-950/25 dark:text-rose-455'
              }`}>
                {results.passed ? <Trophy className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
              </div>

              <h2 className="text-2xl font-extrabold text-text-main ">{results.passed ? 'Quiz Passed!' : 'Quiz Failed'}</h2>
              <p className="mt-1 text-sm text-text-secondary">{results.feedback}</p>

              <div className="my-8 flex justify-center gap-6">
                <div>
                  <span className="text-3xl font-extrabold text-primary ">{results.score} / {results.totalQuestions}</span>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">Score</p>
                </div>
                <div className="w-px h-12 bg-slate-200 " />
                <div>
                  <span className="text-3xl font-extrabold text-primary ">+{results.xpAwarded}</span>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">XP Points</p>
                </div>
              </div>

              {/* Navigation Back */}
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs px-5 py-3 shadow-md shadow-primary/10 transition-all cursor-pointer"
              >
                Return to Course Player
                <Play className="w-4 h-4" />
              </button>
            </div>

            {/* Quiz Leaderboard */}
            {results.leaderboard && results.leaderboard.length > 0 && (
              <div className="glass p-6 rounded-2xl bg-bg-main  shadow-soft">
                <h3 className="font-extrabold text-sm text-text-main  mb-4 flex items-center gap-2">
                  <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500/20" />
                  Quiz High Scorers
                </h3>
                <div className="space-y-3">
                  {results.leaderboard.map((student, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between py-2 border-b border-accent/20 dark:border-accent/20/80 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <img src={student.avatar} className="w-8 h-8 rounded-full" />
                        <span className="text-xs font-bold text-text-main ">{student.name}</span>
                      </div>
                      <span className="text-xs font-bold text-primary dark:text-indigo-455">
                        {student.high_score} / {student.total_questions}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Answers Review Detail */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-text-main ">Review Answers</h3>
              {questions.map((q, idx) => {
                const review = results.review.find(r => r.questionId === q.id);
                return (
                  <div 
                    key={q.id}
                    className="p-5 border border-accent/20 bg-bg-main rounded-2xl dark:border-accent/20  space-y-3"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-xs font-bold text-text-main  leading-relaxed">
                        Q{idx + 1}: {q.question}
                      </h4>
                      {review?.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      )}
                    </div>
                    
                    <div className="space-y-1.5 pl-3">
                      <p className="text-xs text-text-secondary">
                        Your answer: <span className={`font-semibold ${review?.isCorrect ? 'text-primary' : 'text-primary'}`}>{review?.studentAnswer}</span>
                      </p>
                      {!review?.isCorrect && (
                        <p className="text-xs text-emerald-655 font-medium">
                          Correct answer: <span className="font-bold">{review?.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* MCQ Playing Screen */
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="flex justify-between items-center bg-bg-main p-5 rounded-2xl border border-accent/20 dark:border-accent/20 ">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">QUIZ</span>
                <h2 className="text-base font-bold text-slate-955  leading-snug">{quiz?.title}</h2>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-1.5 bg-accent/10 text-rose-700 font-mono text-sm font-bold px-3 py-1.5 rounded-xl border border-rose-100 dark:bg-rose-955/20 dark:text-rose-400 dark:border-rose-900/50">
                <Clock className="w-4.5 h-4.5" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            </div>

            {/* Question Card */}
            {activeQuestion && (
              <div className="glass p-6 rounded-2xl bg-bg-main  shadow-soft">
                <div className="flex justify-between items-center text-xs text-text-secondary mb-4 font-semibold">
                  <span>Question {currentQIdx + 1} of {questions.length}</span>
                </div>
                
                <h3 className="text-sm font-extrabold text-text-main  leading-relaxed mb-6">
                  {activeQuestion.question}
                </h3>

                {/* Options List */}
                <div className="space-y-2.5">
                  {activeQuestion.options.map((option) => {
                    const isSelected = selectedAnswers[activeQuestion.id] === option;
                    return (
                      <button
                        key={option}
                        onClick={() => handleSelectAnswer(activeQuestion.id, option)}
                        className={`w-full flex items-center p-3.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-accent/10 border-primary/30 text-primary  dark:border-primary/30 '
                            : 'bg-bg-secondary border-accent/30 hover:bg-bg-secondary text-text-secondary  dark:border-accent/20 '
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nav Controls */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setCurrentQIdx(prev => Math.max(0, prev - 1))}
                disabled={currentQIdx === 0}
                className="rounded-xl border border-accent/30 bg-bg-main px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-bg-secondary disabled:opacity-40 transition-colors"
              >
                Previous
              </button>

              {currentQIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQIdx(prev => prev + 1)}
                  className="rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2.5 transition-all"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="rounded-xl bg-accent/100 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 transition-all shadow-sm shadow-emerald-200 dark:shadow-none"
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>

          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
