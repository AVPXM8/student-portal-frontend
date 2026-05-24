"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from "@/api";
import MathPreview from '@/components/MathPreview';
import Breadcrumb from '@/components/Breadcrumb';
import { reRenderMathJax } from '@/utils/mathjax';
import styles from "./SingleQuestionPage.module.css";
import AITutor from '@/components/AITutor';

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

/* ----------------------------- helpers ----------------------------- */
const toPlainText = (s = '') => {
  const noTags = s
    .replace(/<[^>]+>/g, ' ')
    .replace(/\$+[^$]*\$+/g, ' ')
    .replace(/\\\[.*?\\\]/gs, ' ')
    .replace(/\\\((.|\\n)*?\\\)/g, ' ');
  const decoded = noTags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
  return decoded.replace(/\s+/g, ' ').trim();
};

/* ----------------------------- component ----------------------------- */
export default function SingleQuestionPage() {
  const { id } = useParams();

  const [question, setQuestion] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);

  const feedbackRef = useRef(null);

  /* ----------------------------- fetch ----------------------------- */
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    async function fetchData() {
      try {
        setLoading(true);
        const [qRes, rRes] = await Promise.all([
          api.get(`/questions/public/${id}`, { signal: controller.signal }),
          api.get(`/questions/public/${id}/related`, { signal: controller.signal })
        ]);
        if (!alive) return;
        setQuestion(qRes.data);
        setRelated(Array.isArray(rRes.data) ? rRes.data : []);
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.message === 'canceled') return;
        console.error('Failed to load question', err);
      } finally {
        if (alive) setLoading(false);
        window.scrollTo(0, 0);
      }
    }
    fetchData();
    return () => { 
      alive = false; 
      controller.abort();
    };
  }, [id]);

  /* ----------------------------- keyboard shortcuts ----------------------------- */
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
      
      const k = e.key.toLowerCase();
      if (!question) return;

      if (['1','2','3','4','a','b','c','d'].includes(k) && !isSubmitted) {
        let idx;
        if (['1','2','3','4'].includes(k)) idx = Number(k) - 1;
        else idx = {a:0, b:1, c:2, d:3}[k];
        
        if (idx < question.options.length) {
          e.preventDefault();
          handleOptionSelect(idx);
        }
      }
      if (k === 'e') { e.preventDefault(); toggleExplanation(); }
      if (k === 'v' && question.videoURL) { e.preventDefault(); setShowVideo(s => !s); }
      if (k === 's') { e.preventDefault(); revealAnswer(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [question, isSubmitted]);

  const handleOptionSelect = (idx) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
    setIsSubmitted(true);
    setShowExplanation(true);
    setTimeout(reRenderMathJax, 0);
    setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior:'smooth', block:'center'}), 100);
  };

  const toggleExplanation = () => {
    setShowExplanation(prev => {
      setTimeout(reRenderMathJax, 0);
      return !prev;
    });
  };

  const revealAnswer = () => {
    setShowCorrect(true);
    setIsSubmitted(true);
    setShowExplanation(true);
    setTimeout(reRenderMathJax, 0);
    setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior:'smooth', block:'center'}), 100);
  };

  if (loading) return <div className={styles.loading}>Loading question…</div>;
  if (!question) return <div className={styles.loading}>Question not found.</div>;

  const isCorrect = question.options?.[selectedOption]?.isCorrect || false;

  return (
    <div className={styles.pageLayout}>
      <div className={styles.mainContent}>
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Questions', href: '/questions' },
          { label: question.exam || 'Exam', href: `/questions?exam=${encodeURIComponent(question.exam || '')}` },
          { label: question.subject || 'Subject', href: `/questions?exam=${encodeURIComponent(question.exam || '')}&subject=${encodeURIComponent(question.subject || '')}` },
          { label: `Q. ${question.questionNumber || id.slice(-6)}` },
        ]} />

        <div className={styles.tipBar}>
          <strong>Tip:</strong>
          <span><span className={styles.kbd}>A–D</span> to answer</span>
          <span><span className={styles.kbd}>E</span> for explanation</span>
          <span><span className={styles.kbd}>V</span> for video</span>
        </div>

        <article className={styles.questionCard}>
          <div className={styles.questionHeader}>
            {question.exam} | {question.subject} | {question.year}
          </div>
          <div className={styles.questionBody}>
            <MathPreview latexString={question.questionText} />
          </div>
          {question.questionImageURL && (
            <img src={question.questionImageURL} alt="Question" className={styles.mainImage} />
          )}
          
          <AITutor questionId={question._id} question={question} />

          <h3 className={styles.optionsHeader}>Options:</h3>
          <div className={styles.optionsGrid}>
            {question.options.map((opt, idx) => {
              let cls = styles.optionButton;
              if (isSubmitted) {
                if (opt.isCorrect) cls += ` ${styles.correct}`;
                else if (idx === selectedOption) cls += ` ${styles.incorrect}`;
              } else if (idx === selectedOption) {
                cls += ` ${styles.selected}`;
              }
              return (
                <button key={idx} className={cls} onClick={() => handleOptionSelect(idx)} disabled={isSubmitted}>
                  <span className={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
                  <div className={styles.optionContent}>
                    <MathPreview latexString={opt.text} />
                    {opt.imageURL && <img src={opt.imageURL} alt="Option" className={styles.optionImage} />}
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        {isSubmitted && (
          <div ref={feedbackRef} className={styles.feedbackCard}>
            <p className={isCorrect || showCorrect ? styles.correctText : styles.incorrectText}>
              {isCorrect ? '✅ Correct!' : '❌ Let\'s review the explanation.'}
            </p>
            <div className={styles.buttonGroup}>
              <button className={styles.primaryBtn} onClick={toggleExplanation}>
                {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
              </button>
              {question.videoURL && (
                <button className={styles.secondaryBtn} onClick={() => setShowVideo(!showVideo)}>
                  {showVideo ? 'Hide Video' : 'Watch Video'}
                </button>
              )}
              {related.length > 0 && (
                   <Link href={`/question/${related[0]._id}`} className={styles.nextBtn}>
                     Next Question &raquo;
                   </Link>
                )}
            </div>
          </div>
        )}

        {showExplanation && (
          <div className={styles.explanationBox}>
            <h3>Explanation</h3>
            <MathPreview latexString={question.explanationText || 'No text explanation available.'} />
            {question.explanationImageURL && <img src={question.explanationImageURL} alt="Explanation" className={styles.mainImage} />}
          </div>
        )}

        {showVideo && question.videoURL && (
          <div className={styles.explanationBox}>
            <h3>Video Solution</h3>
            <div className={styles.playerContainer}>
              <ReactPlayer src={formatVideoURL(question.videoURL)} width="100%" height="100%" controls />
            </div>
          </div>
        )}
      </div>
      <AITutor questionId={question._id} question={question} />

      <aside className={styles.sidebar}>
        {related.length > 0 && (
          <div className={styles.sidebarBlock}>
            <h3>Related Questions</h3>
            {related.map(r => (
              <Link key={r._id} href={`/question/${r._id}`} className={styles.relatedItem}>
                <MathPreview latexString={(r.questionText || '').slice(0, 80) + '...'} />
              </Link>
            ))}
          </div>
        )}

        {/* Internal linking section for SEO */}
        <div className={styles.sidebarBlock}>
          <h3>Practice More</h3>
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {question.exam && (
              <Link href={`/questions?exam=${encodeURIComponent(question.exam)}`} className={styles.relatedItem} style={{fontWeight:600}}>
                All {question.exam} Questions →
              </Link>
            )}
            {question.subject && (
              <Link href={`/questions?exam=${encodeURIComponent(question.exam || '')}&subject=${encodeURIComponent(question.subject)}`} className={styles.relatedItem} style={{fontWeight:600}}>
                More {question.subject} PYQs →
              </Link>
            )}
            {question.year && (
              <Link href={`/questions?exam=${encodeURIComponent(question.exam || '')}&year=${encodeURIComponent(question.year)}`} className={styles.relatedItem} style={{fontWeight:600}}>
                {question.exam} {question.year} Paper →
              </Link>
            )}
            <Link href="/articles" className={styles.relatedItem} style={{fontWeight:600}}>
              📝 Preparation Tips & Articles →
            </Link>
            <Link href="/resources" className={styles.relatedItem} style={{fontWeight:600}}>
              📄 Download PYQ Papers →
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
