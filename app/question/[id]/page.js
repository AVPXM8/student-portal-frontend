/**
 * /app/question/[id]/page.js  — Server Component (RSC)
 *
 * SEO Goals:
 *  - All question content present in initial HTML (no client-side fetch)
 *  - Math pre-rendered via KaTeX (server-side) — no MathJax needed for crawlers
 *  - Full schema.org QAPage + FAQPage JSON-LD with explanation text
 *  - Semantic HTML: <article>, <h1>, <section>, <aside>
 *  - Crawlable without JavaScript
 *  - Client interactivity (option selection, explanation toggle) isolated in QuestionInteractions.jsx
 *  - SSG via generateStaticParams for popular question IDs
 *  - Internal linking: same-topic / same-exam / topic-chip sidebar links
 */

import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';
import ServerMathContent from '@/components/ServerMathContent';
import QuestionInteractions from './QuestionInteractions';
import { renderMathSSR, toPlainTextSSR } from '@/utils/renderMathSSR';
import styles from './SingleQuestionPage.module.css';


const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const SITE_URL = 'https://question.maarula.in';

/* ─────────────────────── generateStaticParams (SSG) ─────────────────────── */
/**
 * Pre-renders popular question pages at build time (ISR-compatible).
 * Falls back to on-demand SSR for any ID not in this list.
 * Extend by pulling more IDs from your API in CI.
 */
export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${API_BASE}/api/questions/public?limit=1000`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data?.questions ?? []);
    return items.map((q) => ({ id: String(q._id) }));
  } catch {
    // API unavailable at build time — skip SSG gracefully
    return [];
  }
}

/* ─────────────────────────── generateMetadata ─────────────────────────── */
export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const res = await fetch(`${API_BASE}/api/questions/public/${id}`, {
      next: { revalidate: 86400 },
    });
    const question = await res.json();

    if (!question?.questionText) return { title: 'Question Not Found' };

    const plainText = toPlainTextSSR(question.questionText).slice(0, 160);
    const titleSnippet = plainText.slice(0, 65);
    const examLabel = question.exam || 'MCA Entrance';
    const subjectLabel = question.subject || '';
    const yearLabel = question.year || '';

    const title = `${examLabel} ${yearLabel} ${subjectLabel} PYQ — ${titleSnippet}… | Mathem Solvex`;
    const description = `Practice this ${subjectLabel} question from ${examLabel} ${yearLabel} with step-by-step solution and video explanation. ${plainText}`;
    const image =
      question.questionImageURL ||
      'https://res.cloudinary.com/dwmj6up6j/image/upload/v1752687380/rqtljy0wi1uzq3itqxoe.png';
    const url = `${SITE_URL}/question/${id}`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        images: [{ url: image }],
        type: 'article',
        siteName: 'Mathem Solvex by Maarula Classes',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return { title: 'Mathem Solvex | Question PYQ Solutions' };
  }
}

/* ─────────────────────────── JSON-LD builders ────────────────────────── */

/** QAPage schema — primary structured data for this question page */
function buildQAPageJsonLd(q, id) {
  const plainQ = toPlainTextSSR(q.questionText).slice(0, 500);
  const correctOpt = q.options?.find((o) => o.isCorrect);
  const correctText = correctOpt
    ? toPlainTextSSR(correctOpt.text).slice(0, 300)
    : 'Correct answer available in explanation section';
  const explanationText = q.explanationText
    ? toPlainTextSSR(q.explanationText).slice(0, 800)
    : '';

  const answerBody = [
    correctText,
    explanationText ? `Explanation: ${explanationText}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    name: `${q.exam || 'MCA'} ${q.year || ''} ${q.subject || ''} Question`,
    url: `${SITE_URL}/question/${id}`,
    mainEntity: {
      '@type': 'Question',
      name: plainQ,
      text: plainQ,
      answerCount: 1,
      datePublished: q.createdAt || new Date().toISOString(),
      author: {
        '@type': 'Person',
        name: 'Vivek Kumar'
      },
      acceptedAnswer: {
        '@type': 'Answer',
        text: answerBody || 'Refer explanation section for detailed solution.',
        url: `${SITE_URL}/question/${id}#explanation-section`,
        author: {
          '@type': 'Person',
          name: 'Vivek Kumar'
        }
      },
    },
    about: {
      '@type': 'Thing',
      name: q.subject || q.topic || 'MCA Entrance',
    },
    provider: {
      '@type': 'Organization',
      name: 'Maarula Classes',
      url: 'https://maarula.in',
    },
  };
}

/**
 * FAQPage schema — supplements QAPage with contextual prep FAQs.
 * Google can surface these as rich results in SERPs alongside the QAPage entry.
 * Having both schemas on one page is valid per Google's guidelines.
 */
function buildFAQJsonLd(q) {
  const exam = q.exam || 'MCA entrance';
  const subject = q.subject || 'Mathematics';
  const year = q.year ? ` ${q.year}` : '';

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How do I solve ${exam}${year} ${subject} questions?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Practice ${exam}${year} ${subject} previous year questions with step-by-step solutions on Mathem Solvex. Each question includes a detailed explanation and video solution to help you master the concept quickly.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the difficulty level of ${exam} ${subject} questions?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${exam} ${subject} questions range from moderate to advanced difficulty. Consistent practice with official previous year papers and topic-wise drills on Mathem Solvex is the most effective preparation strategy.`,
        },
      },
      {
        '@type': 'Question',
        name: `Are ${exam} previous year papers available for free?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. Mathem Solvex provides free access to ${exam} previous year question papers and topic-wise PDFs. You can download them or attempt them as timed live mock tests directly on the platform.`,
        },
      },
    ],
  };
}

// Legacy alias — kept so any future callers still work
function buildJsonLd(q, id) { return buildQAPageJsonLd(q, id); }

/* ──────────────────────────── Page Component ─────────────────────────── */
export default async function Page({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { id } = resolvedParams;

  /* ── Fetch data once on the server ── */
  let question = null;
  let related = [];

  try {
    const [qRes, rRes] = await Promise.all([
      fetch(`${API_BASE}/api/questions/public/${id}`, { next: { revalidate: 86400 } }),
      fetch(`${API_BASE}/api/questions/public/${id}/related`, { next: { revalidate: 86400 } }),
    ]);
    question = await qRes.json();
    const rData = await rRes.json();
    related = Array.isArray(rData) ? rData : [];
  } catch {
    // Render graceful fallback below
  }

  /* ── Pre-render math server-side with KaTeX ── */
  const questionHtml = question?.questionText ? renderMathSSR(question.questionText) : '';
  const optionHtmlList = question?.options?.map((o) => renderMathSSR(o.text || '')) ?? [];
  const explanationHtml = question?.explanationText
    ? renderMathSSR(question.explanationText)
    : '';

  /* ── Build JSON-LD ── */
  const jsonLd = question?.questionText ? buildQAPageJsonLd(question, id) : null;
  const faqJsonLd = question?.questionText ? buildFAQJsonLd(question) : null;

  /* ── Not found state ── */
  if (!question?.questionText) {
    return (
      <main className={styles.loading}>
        <h1>Question not found</h1>
        <p>This question may have been removed or the URL is incorrect.</p>
        <Link href="/questions">← Browse all questions</Link>
      </main>
    );
  }

  const examLabel = question.exam || 'Exam';
  const subjectLabel = question.subject || 'Subject';
  const yearLabel = question.year || '';
  const questionNumber = question.questionNumber || id.slice(-6);

  return (
    <>
      {/* ── Structured Data: QAPage ── */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/* ── Structured Data: FAQPage (alongside QAPage) ── */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className={styles.pageLayout}>
        {/* ══════════ MAIN CONTENT ══════════ */}
        <main className={styles.mainContent}>

          {/* Breadcrumb navigation */}
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Questions', href: '/questions' },
              { label: examLabel, href: `/questions?exam=${encodeURIComponent(examLabel)}` },
              {
                label: subjectLabel,
                href: `/questions?exam=${encodeURIComponent(examLabel)}&subject=${encodeURIComponent(subjectLabel)}`,
              },
              { label: `Q. ${questionNumber}` },
            ]}
          />

          {/* Keyboard shortcut tips */}
          <div className={styles.tipBar} aria-label="Keyboard shortcuts">
            <strong>Tip:</strong>
            <span><span className={styles.kbd}>A–D</span> to answer</span>
            <span><span className={styles.kbd}>E</span> for explanation</span>
            <span><span className={styles.kbd}>V</span> for video</span>
            <span><span className={styles.kbd}>S</span> to reveal answer</span>
          </div>

          {/* ── Question card ── */}
          <article className={styles.questionCard} itemScope itemType="https://schema.org/Question">

            {/* Semantic header: h1 for primary content */}
            <header className={styles.questionHeader}>
              <h1 className={styles.questionH1} itemProp="name">
                {examLabel} {yearLabel} — {subjectLabel} PYQ
              </h1>
              <span className={styles.questionMeta} aria-label="Exam metadata">
                {examLabel} | {subjectLabel} | {yearLabel}
              </span>
            </header>

            {/* Question body — server-rendered KaTeX math, crawlable */}
            <section
              className={styles.questionBody}
              aria-label="Question"
              itemProp="text"
            >
              <ServerMathContent html={questionHtml} />
            </section>

            {/* Question image (if any) */}
            {question.questionImageURL && (
              <Image
                src={question.questionImageURL}
                alt={`Diagram for ${examLabel} ${yearLabel} ${subjectLabel} question`}
                className={styles.mainImage}
                width={800}
                height={400}
                loading="lazy"
                style={{ width: '100%', height: 'auto' }}
              />
            )}

            {/* Options header */}
            <h2 className={styles.optionsHeader} id="options-heading">
              Choose the correct answer:
            </h2>

            {/*
              ── CRAWLABLE FALLBACK OPTIONS (no-JS) ──
              Rendered as a plain ordered list inside a <noscript> and also
              as a visually-hidden section so search engines always see all
              four options + the correct answer without executing JS.
            */}
            <section
              className={styles.seoOnly}
              aria-hidden="true"
              id="seo-options"
            >
              <ol>
                {question.options?.map((opt, idx) => (
                  <li key={idx} data-correct={opt.isCorrect ? 'true' : undefined}>
                    <strong>{String.fromCharCode(65 + idx)}.</strong>{' '}
                    <span dangerouslySetInnerHTML={{ __html: optionHtmlList[idx] }} />
                    {opt.isCorrect && <em> (Correct Answer)</em>}
                  </li>
                ))}
              </ol>
            </section>

            {/* Correct answer — crawlable, hidden visually */}
            {(() => {
              const correctIdx = question.options?.findIndex((o) => o.isCorrect);
              return correctIdx >= 0 ? (
                <section
                  className={styles.seoOnly}
                  aria-hidden="true"
                  id="seo-answer"
                  itemScope
                  itemType="https://schema.org/Answer"
                >
                  <span itemProp="text">
                    Correct Answer:{' '}
                    <span
                      dangerouslySetInnerHTML={{ __html: optionHtmlList[correctIdx] }}
                    />
                  </span>
                </section>
              ) : null;
            })()}

            {/* Explanation — crawlable, hidden visually (interactive version below) */}
            {explanationHtml && (
              <section
                className={styles.seoOnly}
                aria-hidden="true"
                id="seo-explanation"
              >
                <h3>Explanation</h3>
                <div dangerouslySetInnerHTML={{ __html: explanationHtml }} />
              </section>
            )}

            {/* ── Client-side interactions (option buttons, explanation toggle) ── */}
            <QuestionInteractions
              question={question}
              optionHtmlList={optionHtmlList}
              explanationHtml={explanationHtml}
              related={related}
            />
          </article>

        </main>

        {/* ══════════ SIDEBAR ══════════ */}
        <aside className={styles.sidebar} aria-label="Related content">

          {/* ── Related questions (same topic from API) ── */}
          {related.length > 0 && (
            <section className={styles.sidebarBlock}>
              <h2 className={styles.sidebarBlock_h}>Same Topic Questions</h2>
              <nav aria-label="Same topic questions">
                {related.slice(0, 6).map((r) => (
                  <Link
                    key={r._id}
                    href={`/question/${r._id}`}
                    className={styles.relatedItem}
                  >
                    {/* Label chips for exam/year context */}
                    {(r.exam || r.year) && (
                      <span className={styles.relatedChip}>
                        {r.exam}{r.year ? ` '${String(r.year).slice(-2)}` : ''}
                      </span>
                    )}
                    <span
                      dangerouslySetInnerHTML={{
                        __html: renderMathSSR((r.questionText || '').slice(0, 100) + '…'),
                      }}
                    />
                  </Link>
                ))}
              </nav>
            </section>
          )}

          {/* ── Internal linking: topic + exam filtered ── */}
          <section
            className={styles.sidebarBlock}
            style={{ marginTop: related.length > 0 ? '20px' : 0 }}
          >
            <h2 className={styles.sidebarBlock_h}>Explore More</h2>
            <nav
              aria-label="Explore more practice links"
              className={styles.exploreNav}
            >
              {/* 1. Topic-scoped link (most specific) */}
              {question.topic && question.exam && (
                <Link
                  href={`/questions?exam=${encodeURIComponent(question.exam)}&topic=${encodeURIComponent(question.topic)}`}
                  className={`${styles.relatedItem} ${styles.relatedItemStrong}`}
                >
                  <span className={styles.relatedChip} style={{ background: 'var(--primary)', color: '#fff' }}>Topic</span>
                  All "{question.topic}" PYQs →
                </Link>
              )}

              {/* 2. Subject-scoped link */}
              {question.subject && (
                <Link
                  href={`/questions?exam=${encodeURIComponent(question.exam || '')}&subject=${encodeURIComponent(question.subject)}`}
                  className={`${styles.relatedItem} ${styles.relatedItemStrong}`}
                >
                  <span className={styles.relatedChip}>Subject</span>
                  More {question.subject} Questions →
                </Link>
              )}

              {/* 3. Year-paper link */}
              {question.year && question.exam && (
                <Link
                  href={`/questions?exam=${encodeURIComponent(question.exam)}&year=${encodeURIComponent(question.year)}`}
                  className={`${styles.relatedItem} ${styles.relatedItemStrong}`}
                >
                  <span className={styles.relatedChip}>Year</span>
                  {question.exam} {question.year} Paper →
                </Link>
              )}

              {/* 4. All exam questions */}
              {question.exam && (
                <Link
                  href={`/questions?exam=${encodeURIComponent(question.exam)}`}
                  className={styles.relatedItem}
                >
                  All {question.exam} Questions →
                </Link>
              )}

              {/* 5. Cross-links to other site sections */}
              <Link href="/resources" className={styles.relatedItem}>
                📄 Download {question.exam || ''} PYQ Papers →
              </Link>
              <Link href="/articles" className={styles.relatedItem}>
                📝 Preparation Tips & Articles →
              </Link>
            </nav>
          </section>
        </aside>
      </div>
    </>
  );
}
