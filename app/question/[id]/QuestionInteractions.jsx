"use client";
/**
 * QuestionInteractions — Client Component
 *
 * Handles all interactive state for the question page:
 *  - Option selection and submission
 *  - Explanation toggle
 *  - Video toggle
 *  - Keyboard shortcuts
 *
 * Core content (question text, options text, explanation text) is
 * rendered server-side in page.js and passed here as pre-rendered HTML.
 * This component only controls visibility / UI state.
 */

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ServerMathContent from '@/components/ServerMathContent';
/* PERF: Removed dead reRenderMathJax import — KaTeX is server-rendered, no client re-rendering needed */
import styles from './SingleQuestionPage.module.css';
import * as gtag from '@/lib/gtag';

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
const AITutor = dynamic(() => import('@/components/AITutor'), { ssr: false });

/**
 * @param {object} props
 * @param {object}   props.question          - Raw question object from API
 * @param {string[]} props.optionHtmlList    - Pre-rendered KaTeX HTML for each option
 * @param {string}   props.explanationHtml   - Pre-rendered KaTeX HTML for explanation
 * @param {object[]} props.related           - Related questions array
 */
export default function QuestionInteractions({
  question,
  optionHtmlList,
  explanationHtml,
  related,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const feedbackRef = useRef(null);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

      const k = e.key.toLowerCase();
      if (['1', '2', '3', '4', 'a', 'b', 'c', 'd'].includes(k) && !isSubmitted) {
        let idx;
        if (['1', '2', '3', '4'].includes(k)) idx = Number(k) - 1;
        else idx = { a: 0, b: 1, c: 2, d: 3 }[k];

        if (idx < (question?.options?.length ?? 0)) {
          e.preventDefault();
          handleOptionSelect(idx);
        }
      }
      if (k === 'e') { e.preventDefault(); toggleExplanation(); }
      if (k === 'v' && question?.videoURL) { e.preventDefault(); setShowVideo(s => !s); }
      if (k === 's') { e.preventDefault(); revealAnswer(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, isSubmitted]);

  const handleOptionSelect = (idx) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
    setIsSubmitted(true);
    setShowExplanation(true);
    
    // Track Question Solve
    gtag.event('question_solve', {
      question_id: question?._id,
      is_correct: question?.options?.[idx]?.isCorrect || false,
      exam_name: question?.exam
    });

    setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const toggleExplanation = () => {
    const nextState = !showExplanation;
    setShowExplanation(nextState);
    
    if (nextState) {
      gtag.event('explanation_view', {
        question_id: question?._id
      });
    }


  };

  const revealAnswer = () => {
    setIsSubmitted(true);
    setShowExplanation(true);
    
    // Track Answer Reveal
    gtag.event('question_reveal', {
      question_id: question?._id
    });


    setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const isCorrect = question?.options?.[selectedOption]?.isCorrect || false;

  return (
    <>
      <AITutor questionId={question?._id} question={question} />

      {/* ── Options (interactive buttons wrapping server-rendered content) ── */}
      <section aria-label="Answer options" className={styles.optionsGrid}>
        {question?.options?.map((opt, idx) => {
          let cls = styles.optionButton;
          if (isSubmitted) {
            if (opt.isCorrect) cls += ` ${styles.correct}`;
            else if (idx === selectedOption) cls += ` ${styles.incorrect}`;
          } else if (idx === selectedOption) {
            cls += ` ${styles.selected}`;
          }
          return (
            <button
              key={idx}
              className={cls}
              onClick={() => handleOptionSelect(idx)}
              disabled={isSubmitted}
              aria-label={`Option ${String.fromCharCode(65 + idx)}`}
              aria-pressed={idx === selectedOption}
            >
              <span className={styles.optionLetter} aria-hidden="true">
                {String.fromCharCode(65 + idx)}
              </span>
              <div className={styles.optionContent}>
                {/* Use pre-rendered HTML from server if available, else fallback */}
                {optionHtmlList?.[idx] ? (
                  <ServerMathContent html={optionHtmlList[idx]} />
                ) : (
                  <span>{opt.text}</span>
                )}
                {opt.imageURL && (
                  <img src={opt.imageURL} alt={`Option ${String.fromCharCode(65 + idx)} diagram`} className={styles.optionImage} />
                )}
              </div>
            </button>
          );
        })}
      </section>

      {/* ── Reveal answer shortcut ── */}
      {!isSubmitted && (
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button
            className={styles.secondaryBtn}
            onClick={revealAnswer}
            aria-label="Reveal the correct answer"
          >
            Show Answer <span className={styles.kbd}>S</span>
          </button>
        </div>
      )}

      {/* ── Feedback card ── */}
      {isSubmitted && (
        <div ref={feedbackRef} className={styles.feedbackCard} role="status" aria-live="polite">
          <p className={isCorrect ? styles.correctText : styles.incorrectText}>
            {isCorrect ? '✅ Correct!' : "❌ Let's review the explanation."}
          </p>
          <div className={styles.buttonGroup}>
            <button
              className={styles.primaryBtn}
              onClick={toggleExplanation}
              aria-expanded={showExplanation}
              aria-controls="explanation-section"
            >
              {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
            </button>
            {question?.videoURL && (
              <button
                className={styles.secondaryBtn}
                onClick={() => setShowVideo(s => !s)}
                aria-expanded={showVideo}
                aria-controls="video-section"
              >
                {showVideo ? 'Hide Video' : 'Watch Video'}
              </button>
            )}
            {related?.length > 0 && (
              <Link href={`/question/${related[0]._id}`} className={styles.nextBtn}>
                Next Question »
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Explanation (uses server-pre-rendered HTML) ── */}
      <section
        id="explanation-section"
        className={styles.explanationBox}
        style={{ display: showExplanation ? 'block' : 'none' }}
        aria-hidden={!showExplanation}
      >
        <h2 className={styles.explanationBox_heading}>Explanation</h2>
        {explanationHtml ? (
          <ServerMathContent html={explanationHtml} />
        ) : (
          <p>No text explanation available.</p>
        )}
        {question?.explanationImageURL && (
          <img
            src={question.explanationImageURL}
            alt="Explanation diagram"
            className={styles.mainImage}
          />
        )}
      </section>

      {/* ── Video Solution ── */}
      {showVideo && question?.videoURL && (
        <section id="video-section" className={styles.explanationBox}>
          <h2 className={styles.explanationBox_heading}>Video Solution</h2>
          <div className={styles.playerContainer}>
            <ReactPlayer src={formatVideoURL(question.videoURL)} width="100%" height="100%" controls />
          </div>
        </section>
      )}
    </>
  );
}
