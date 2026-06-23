"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Check, X, ChevronLeft, ChevronRight, 
  Clock, Save, Award, EyeOff, Flag, Menu, LogOut, LayoutGrid
} from 'lucide-react';
import api from "@/api";
import MathPreview from '@/components/MathPreview';
import useMathJax from '@/hooks/useMathJax';
import styles from "./TestEnvironmentPage.module.css";
import * as gtag from '@/lib/gtag';

// Dynamically import ReactPlayer to prevent hydration issues
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const formatVideoURL = (url) => {
  if (!url || typeof url !== 'string') return '';
  const cleanUrl = url.trim();
  const liveMatch = cleanUrl.match(/https?:\/\/(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]+)/i);
  if (liveMatch) return `https://www.youtube.com/watch?v=${liveMatch[1]}`;
  const shortsMatch = cleanUrl.match(/https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i);
  if (shortsMatch) return `https://www.youtube.com/watch?v=${shortsMatch[1]}`;
  return cleanUrl;
};

// Ordering for sections in palette
const SECTION_ORDER = {
  'MATHEMATICS': 1,
  'ANALYTICAL ABILITY & LOGICAL REASONING': 2,
  'COMPUTER AWARENESS': 3,
  'GENERAL ENGLISH': 4,
};

const EXAM_CONFIGS = {
  'NIMCET': {
    time: 120, // minutes
    marking: 'special',
    sections: ['MATHEMATICS', 'ANALYTICAL ABILITY & LOGICAL REASONING', 'COMPUTER AWARENESS', 'GENERAL ENGLISH']
  },
  'CUET PG': {
    time: 75,
    marking: 'standard',
    correct: 4,
    incorrect: -1
  }
};

const TestEnvironmentPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const examName = searchParams.get('exam') || '';
  const subject  = searchParams.get('subject') || '';
  const topic    = searchParams.get('topic') || '';
  const year     = searchParams.get('year') || '';
  const page     = parseInt(searchParams.get('page') || '1', 10);
  const limit    = parseInt(searchParams.get('limit') || '300', 10);
  const titleQuery = searchParams.get('search') || '';

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isQuestionRevealed, setIsQuestionRevealed] = useState(false);
  const [status, setStatus] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [fullQuestions, setFullQuestions] = useState({});
  const [loadingFullQuestions, setLoadingFullQuestions] = useState({});

  // Fetch Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const params = { page, limit };
        if (examName) params.exam = examName;
        if (subject) params.subject = subject;
        if (topic) params.topic = topic;
        if (titleQuery) params.search = titleQuery;
        if (year) params.year = year;

        const res = await api.get('/questions/public', { params });
        let data = res.data?.questions || [];
        
        // Sort based on Section Order
        data.sort((a, b) => {
          const wA = SECTION_ORDER[(a.subject || '').toUpperCase()] || 99;
          const wB = SECTION_ORDER[(b.subject || '').toUpperCase()] || 99;
          if (wA !== wB) return wA - wB;
          return (parseInt(a.questionNumber) || 0) - (parseInt(b.questionNumber) || 0);
        });

        setQuestions(data);
        
        const initialStatus = {};
        data.forEach((_, index) => {
          initialStatus[index] = 'unvisited';
        });
        setStatus(initialStatus);
        
        let config = EXAM_CONFIGS[(examName || '').toUpperCase()] || EXAM_CONFIGS['NIMCET'];
        if (!year && topic) {
          // Defaults for topic tests
          config = { time: 60, correct: 1, incorrect: 0 };
        }
        setTimeLeft(config.time * 60);
      } catch (err) {
        console.error("Failed to fetch questions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [examName, subject, topic, page, limit, year, titleQuery]);

  // Reveal questions after a short delay to allow MathJax to typeset
  useEffect(() => {
    if (!loading && questions.length > 0) {
      const timer = setTimeout(() => setIsQuestionRevealed(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIsQuestionRevealed(false);
    }
  }, [loading, questions, currentIndex]);

  // Timer logic
  useEffect(() => {
    if (!isTestStarted || isTestSubmitted || timeLeft <= 0 || isReviewMode) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTestStarted, isTestSubmitted, timeLeft, isReviewMode]);

  const startTest = () => {
    setIsTestStarted(true);
    setStatus(prev => ({ ...prev, [0]: 'visited' }));
    
    // Track Test Start
    gtag.event('test_start', {
      exam_name: examName,
      subject: subject,
      topic: topic,
      year: year,
      total_questions: questions.length
    });
  };

  const submitTest = useCallback(() => {
    setIsTestSubmitted(true);
    setIsSidebarOpen(false);

    // Track Test Submit (scores tracked separately after results computed)
    gtag.event('test_submit', {
      exam_name: examName,
      total_questions: questions.length,
    });
  }, [examName, questions.length]);

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    router.back();
  };

  const handleOptionSelect = (index, optionIndex) => {
    if (isTestSubmitted || isReviewMode) return;
    setAnswers(prev => ({ ...prev, [index]: optionIndex }));
    setStatus(prev => ({ ...prev, [index]: 'answered' }));
  };

  const toggleMarkForReview = (index) => {
    if (isTestSubmitted || isReviewMode) return;
    setStatus(prev => ({
      ...prev,
      [index]: prev[index] === 'marked' ? (answers[index] !== undefined ? 'answered' : 'visited') : 'marked'
    }));
  };

  const goToQuestion = (index) => {
    setCurrentIndex(index);
    if (status[index] === 'unvisited') {
      setStatus(prev => ({ ...prev, [index]: 'visited' }));
    }
    
    // Track Question View
    gtag.event('test_question_view', {
      exam_name: examName,
      question_index: index + 1,
      total_questions: questions.length
    });

    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  };

  const clearResponse = (index) => {
    if (isTestSubmitted || isReviewMode) return;
    const newAnswers = { ...answers };
    delete newAnswers[index];
    setAnswers(newAnswers);
    setStatus(prev => ({ ...prev, [index]: 'visited' }));
  };

  const startReviewMode = () => {
    setIsReviewMode(true);
    setCurrentIndex(0);
    window.scrollTo(0, 0);
  };

  const fetchFullQuestion = async (index) => {
    if (fullQuestions[index]) return;
    const q = questions[index];
    setLoadingFullQuestions(prev => ({ ...prev, [index]: true }));
    try {
      const res = await api.get(`/questions/public/${q._id}`);
      setFullQuestions(prev => ({ ...prev, [index]: res.data }));
    } catch (err) {
      console.error('Failed to load full question data', err);
    } finally {
      setLoadingFullQuestions(prev => ({ ...prev, [index]: false }));
    }
  };

  useEffect(() => {
    if (isReviewMode) {
      fetchFullQuestion(currentIndex);
    }
  }, [currentIndex, isReviewMode]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Quick status counts for mobile toolbar
  const statusCounts = useMemo(() => {
    const counts = { answered: 0, marked: 0, visited: 0, unvisited: 0 };
    Object.values(status).forEach(s => { counts[s] = (counts[s] || 0) + 1; });
    return counts;
  }, [status]);

  // Score Calculation
  const results = useMemo(() => {
    if (!isTestSubmitted) return null;
    let score = 0;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    questions.forEach((q, idx) => {
      const userAns = answers[idx];
      const correctAns = q.correctOption;
      
      if (userAns === undefined) {
        unattempted++;
      } else if (userAns === correctAns) {
        correct++;
        if ((examName || '').toUpperCase() === 'NIMCET') {
          const sub = (q.subject || '').toUpperCase();
          if (sub === 'MATHEMATICS') score += 12;
          else if (sub === 'COMPUTER') score += 6;
          else if (sub === 'ENGLISH') score += 4;
          else score += 6;
        } else {
          score += (EXAM_CONFIGS[(examName || '').toUpperCase()]?.correct || 1);
        }
      } else {
        incorrect++;
        if ((examName || '').toUpperCase() === 'NIMCET') {
          const sub = (q.subject || '').toUpperCase();
          if (sub === 'MATHEMATICS') score -= 3;
          else if (sub === 'COMPUTER') score -= 1.5;
          else if (sub === 'ENGLISH') score -= 1;
          else score -= 1.5;
        } else {
          score += (EXAM_CONFIGS[(examName || '').toUpperCase()]?.incorrect || 0);
        }
      }
    });

    return { score, correct, incorrect, unattempted, total: questions.length };
  }, [isTestSubmitted, questions, answers, examName]);

  const maxMarkString = useMemo(() => {
     if ((examName || '').toUpperCase() === 'NIMCET') {
        return questions.reduce((acc, q) => {
          const sub = (q.subject || '').toUpperCase();
          if (sub === 'MATHEMATICS') return acc + 12;
          if (sub === 'COMPUTER') return acc + 6;
          if (sub === 'ENGLISH') return acc + 4;
          return acc + 6;
        }, 0).toString();
     }
     let config = EXAM_CONFIGS[(examName || '').toUpperCase()];
     if (!config) config = { correct: 1 };
     return (questions.length * config.correct).toString();
  }, [examName, questions]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Preparing Exam Environment...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <h2>No Questions Found</h2>
        <p>We couldn&apos;t find questions for this criteria. Please try another topic.</p>
        <button onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  // Question Groups by Subject (for palette)
  const groupedQuestions = questions.reduce((acc, q, idx) => {
    const sub = q.subject || 'General';
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push({ ...q, originalIndex: idx });
    return acc;
  }, {});

  const sortedSubjects = Object.keys(groupedQuestions).sort((a, b) => {
    return (SECTION_ORDER[a.toUpperCase()] || 99) - (SECTION_ORDER[b.toUpperCase()] || 99);
  });

  return (
    <div className={styles.testWrapper}>
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className={styles.exitOverlay}>
          <div className={styles.exitModal}>
            <LogOut size={40} className={styles.exitIcon} />
            <h3>Exit Test?</h3>
            <p>Your progress will be lost. Are you sure you want to leave this test?</p>
            <div className={styles.exitActions}>
              <button className={styles.exitCancelBtn} onClick={() => setShowExitConfirm(false)}>
                Continue Test
              </button>
              <button className={styles.exitConfirmBtn} onClick={confirmExit}>
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={styles.testHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.exitBtn} onClick={handleExit} aria-label="Exit test">
            <LogOut size={18} />
            <span className={styles.exitBtnText}>Exit</span>
          </button>
          <div className={styles.examInfo}>
            <h1>{(examName || 'Mock').toUpperCase()} Mock Test</h1>
            <span>{topic || subject || 'Full Paper'}</span>
          </div>
        </div>
        
        {isTestStarted && !isTestSubmitted && !isReviewMode && (
          <div className={`${styles.timer} ${timeLeft < 300 ? styles.timerUrgent : ''}`}>
            <Clock size={16} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
        {isReviewMode && (
          <div className={styles.timerBadge}>
             <Clock size={16} /> 
             <span>Review Mode</span>
          </div>
        )}

        <div className={styles.headerRight}>
          {isTestStarted && !isTestSubmitted && !isReviewMode && (
            <>
              <button className={styles.menuBtn} onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Question palette">
                <LayoutGrid size={20} />
              </button>
              <button className={styles.submitBtn} onClick={submitTest}>Submit</button>
            </>
          )}
          {isReviewMode && (
             <button className={styles.menuBtn} onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Question palette">
                <LayoutGrid size={20} />
             </button>
          )}
        </div>
      </header>

      {!isTestStarted ? (
        <div className={styles.instructionsOverlay}>
          <div className={styles.instructionsContent}>
            <h2>Exam Instructions</h2>
            <div className={styles.statsRow}>
              <div className={styles.infoCard}>
                <span>Duration</span>
                <span>{EXAM_CONFIGS[(examName || '').toUpperCase()]?.time || 60} Min</span>
              </div>
              <div className={styles.infoCard}>
                <span>Total Questions</span>
                <span>{questions.length}</span>
              </div>
              <div className={styles.infoCard}>
                <span>Max Marks</span>
                <span>{maxMarkString}</span>
              </div>
            </div>

            <div className={styles.markingBox}>
               <h3>General Instructions & Marking Scheme</h3>
               <ul>
                 <li>The clock will be set at the server. The countdown timer will help you manage your time.</li>
                 <li>When the timer reaches zero, the examination will end by itself.</li>
                 <li>The Question Palette shows the status of each question using different colors.</li>
                 {((examName || '').toUpperCase() === 'NIMCET') ? (
                   <>
                    <li><strong>Mathematics:</strong> +12 / -3</li>
                    <li><strong>Analytical Ability:</strong> +6 / -1.5</li>
                    <li><strong>Computer Awareness:</strong> +6 / -1.5</li>
                    <li><strong>General English:</strong> +4 / -1</li>
                   </>
                 ) : (
                   <li><strong>Marking:</strong> +{EXAM_CONFIGS[(examName || '').toUpperCase()]?.correct || 1} / {EXAM_CONFIGS[(examName || '').toUpperCase()]?.incorrect || 0}</li>
                 )}
               </ul>
            </div>

            <div className={styles.instructionsBtnRow}>
              <button className={styles.startBtn} onClick={startTest}>Start Examination</button>
              <button className={styles.backBtn} onClick={() => router.back()}>← Go Back</button>
            </div>
          </div>
        </div>
      ) : (isTestSubmitted && !isReviewMode) ? (
        <div className={styles.resultsOverlay}>
          <div className={styles.resultsCard}>
            <Award className={styles.awardIcon} size={56} />
            <h2>Test Results</h2>
            <div className={styles.scoreCircle}>
              <span className={styles.finalScore}>{results.score}</span>
              <span className={styles.totalPossible}>/ {maxMarkString}</span>
            </div>
            
            <div className={styles.resultStatsGrid}>
              <div className={styles.resStat}>
                <span className={styles.statLabel}>Correct</span>
                <span className={`${styles.statValue} ${styles.correctText}`}>{results.correct}</span>
              </div>
              <div className={styles.resStat}>
                <span className={styles.statLabel}>Incorrect</span>
                <span className={`${styles.statValue} ${styles.incorrectText}`}>{results.incorrect}</span>
              </div>
              <div className={styles.resStat}>
                <span className={styles.statLabel}>Unattempted</span>
                <span className={styles.statValue}>{results.unattempted}</span>
              </div>
              <div className={styles.resStat}>
                <span className={styles.statLabel}>Accuracy</span>
                <span className={styles.statValue}>
                  {results.total > results.unattempted 
                    ? Math.round((results.correct / (results.total - results.unattempted)) * 100) 
                    : 0}%
                </span>
              </div>
            </div>

            <div className={styles.resultsActions}>
              <button className={styles.primaryBtn} onClick={startReviewMode} style={{background: '#1e293b'}}>Review Answers & Solutions</button>
              <button className={styles.secondaryBtn} onClick={() => router.back()}>Exit to Resources</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <main className={styles.mainArea}>
            {/* Question Viewer */}
            <section className={styles.questionSection}>
              <div className={styles.questionHeader}>
                <span className={styles.qNumber}>
                   {isReviewMode ? `Reviewing Q ${currentIndex + 1} / ${questions.length}` : `Q ${currentIndex + 1} / ${questions.length}`}
                </span>
                <div className={styles.qActions}>
                  {!isReviewMode && (
                    <button 
                      className={`${styles.actionBtn} ${status[currentIndex] === 'marked' ? styles.actionActive : ''}`}
                      onClick={() => toggleMarkForReview(currentIndex)}
                    >
                      <Flag size={14} /> <span className={styles.actionBtnText}>Mark</span>
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.questionBody}>
                <div className={`${styles.questionText} ${isQuestionRevealed ? styles.revealed : styles.hidden}`}>
                  <MathPreview latexString={fullQuestions[currentIndex]?.questionText || questions[currentIndex]?.questionText} />
                </div>

                {(fullQuestions[currentIndex]?.questionImage || questions[currentIndex]?.questionImage) && (
                  <div className={styles.qImage}>
                    <img src={fullQuestions[currentIndex]?.questionImage || questions[currentIndex].questionImage} alt="Question" />
                  </div>
                )}

                <div className={`${styles.optionsGrid} ${isQuestionRevealed ? styles.revealed : styles.hidden}`}>
                  {(fullQuestions[currentIndex]?.options || questions[currentIndex]?.options)?.map((option, idx) => {
                    const isSelected = answers[currentIndex] === idx;
                    const isCorrectNode = isReviewMode && option.isCorrect;
                    const isWrongNode = isReviewMode && isSelected && !option.isCorrect;
                    
                    let itemClass = styles.optionBtn;
                    if (!isReviewMode && isSelected) itemClass += ` ${styles.selectedOption}`;
                    if (isCorrectNode) itemClass += ` ${styles.correctOption}`;
                    if (isWrongNode) itemClass += ` ${styles.incorrectOption}`;

                    return (
                      <button
                        key={idx}
                        className={itemClass}
                        onClick={() => handleOptionSelect(currentIndex, idx)}
                        style={{ cursor: isReviewMode ? 'default' : 'pointer' }}
                      >
                        <span className={styles.optionLabel}>{String.fromCharCode(65 + idx)}</span>
                        <div className={styles.optionContent}>
                          <MathPreview latexString={typeof option === 'string' ? option : option?.text || ''} />
                          {option?.imageURL && <img src={option.imageURL} alt="Option" className={styles.optionImage} />}
                        </div>
                        {isCorrectNode && <Check className={styles.correctIcon} size={24} />}
                      </button>
                    );
                  })}
                </div>

                {isReviewMode && (
                  <div className={styles.solutionBox}>
                     <div className={styles.solutionTitle}><Check size={18} /> Solution & Explanation</div>
                     {loadingFullQuestions[currentIndex] ? (
                       <div>Loading solution detailed resources...</div>
                     ) : (
                       <div className={styles.solutionContent}>
                          {fullQuestions[currentIndex]?.explanationText && <MathPreview latexString={fullQuestions[currentIndex].explanationText} />}
                          {!fullQuestions[currentIndex]?.explanationText && !fullQuestions[currentIndex]?.explanationImageURL && !fullQuestions[currentIndex]?.videoURL && (
                            <p>No detailed explanation available. The correct option is highlighted above.</p>
                          )}
                          {fullQuestions[currentIndex]?.explanationImageURL && (
                            <img src={fullQuestions[currentIndex].explanationImageURL} alt="Explanation" style={{maxWidth: '100%', borderRadius: 8, marginTop: 16}} />
                          )}
                           {fullQuestions[currentIndex]?.videoURL && (
                             <div style={{marginTop: 16, height: 400}}>
                                <ReactPlayer src={formatVideoURL(fullQuestions[currentIndex].videoURL)} width="100%" height="100%" controls />
                             </div>
                           )}
                       </div>
                     )}
                  </div>
                )}
              </div>

              <div className={styles.footerNav}>
                <button 
                  className={styles.navBtn} 
                  onClick={prevQuestion} 
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft size={18} /> <span className={styles.navBtnLabel}>Prev</span>
                </button>
                
                {!isReviewMode && answers[currentIndex] !== undefined && (
                   <button className={styles.clearBtn} onClick={() => clearResponse(currentIndex)}>Clear</button>
                )}

                {!isReviewMode && currentIndex === questions.length - 1 ? (
                  <button className={styles.submitBtnInline} onClick={submitTest}>Submit</button>
                ) : (
                  <button className={styles.navBtnPrimary} onClick={nextQuestion} disabled={currentIndex === questions.length - 1}>
                    <span className={styles.navBtnLabel}>Next</span> <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </section>

            {/* Mobile backdrop */}
            {isSidebarOpen && (
              <div className={styles.sidebarBackdrop} onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar / Palette */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
               <div className={styles.sidebarHeader}>
                  <h3>Question Palette</h3>
                  <button className={styles.closeSidebar} onClick={() => setIsSidebarOpen(false)}>
                    <X size={20} />
                  </button>
               </div>

               <div className={styles.paletteScroll}>
                  {sortedSubjects.map(sub => (
                    <div key={sub} className={styles.paletteSection}>
                      <h4>{sub}</h4>
                      <div className={styles.paletteGrid}>
                        {groupedQuestions[sub].map(q => {
                          const idx = q.originalIndex;
                          const qStatus = status[idx];
                          return (
                            <button
                              key={idx}
                              onClick={() => goToQuestion(idx)}
                              className={`${styles.pCell} ${styles[`status-${qStatus}`]} ${currentIndex === idx ? styles.currentPCell : ''}`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
               </div>

               <div className={styles.legend}>
                  <div className={styles.legendItem}><span className={`${styles.lBox} ${styles.status_answered}`}></span> Answered</div>
                  <div className={styles.legendItem}><span className={`${styles.lBox} ${styles.status_marked}`}></span> Marked</div>
                  <div className={styles.legendItem}><span className={`${styles.lBox} ${styles.status_visited}`}></span> Not Answered</div>
                  <div className={styles.legendItem}><span className={`${styles.lBox} ${styles.status_unvisited}`}></span> Not Visited</div>
               </div>
            </aside>
          </main>

          {/* Mobile bottom toolbar */}
          <div className={styles.mobileToolbar}>
            <div className={styles.toolbarStats}>
              <span className={styles.toolbarStatItem} style={{color:'#16A34A'}}>{statusCounts.answered} ✓</span>
              <span className={styles.toolbarStatItem} style={{color:'#7C3AED'}}>{statusCounts.marked} ⚑</span>
              <span className={styles.toolbarStatItem} style={{color:'#DC2626'}}>{statusCounts.visited} ○</span>
            </div>
            <button className={styles.toolbarPaletteBtn} onClick={() => setIsSidebarOpen(true)}>
              <LayoutGrid size={18} /> Palette
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TestEnvironmentPage;
