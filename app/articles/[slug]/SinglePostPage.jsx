"use client";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from "react";


import dynamic from 'next/dynamic';
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

import api from "@/api";
import useMathJax from '@/hooks/useMathJax';
import Breadcrumb from '@/components/Breadcrumb';
import styles from "./SinglePostPage.module.css";

import {
  FaWhatsapp,
  FaTelegram,
  FaFacebook,
  FaLinkedin,
  FaXTwitter,
  FaLink,
} from "react-icons/fa6";

/* ---------- small helpers (safe & deterministic) ---------- */
const stripHtml = (s = "") =>
  s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/* truncate & esc removed — not used in this component */

const baseSlug = (s = "") =>
  s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

/** Slugify with guaranteed non-empty + uniqueness */
function slugifyUnique(text, used) {
  const raw = (text || "").trim();
  if (!raw) return null;
  const base = baseSlug(raw) || "section";
  const seen = used.get(base) || 0;
  used.set(base, seen + 1);
  return seen > 0 ? `${base}-${seen + 1}` : base;
}

const FALLBACK_IMAGE = "https://res.cloudinary.com/dwmj6up6j/image/upload/v1752687380/rqtljy0wi1uzq3itqxoe.png";

/* ===========================================================
   Component
   =========================================================== */
export default function SinglePostPage({ initialPost, initialRecentPosts, initialRelatedPosts }) {
  const { slug } = useParams();

  // Hooks in fixed order
  const [post, setPost] = useState(initialPost || null);
  const [recentPosts, setRecentPosts] = useState(initialRecentPosts || []);
  const [relatedPosts, setRelatedPosts] = useState(initialRelatedPosts || []);
  const [loading, setLoading] = useState(!initialPost);
  const [toc, setToc] = useState([]);
  const contentRef = useRef(null);

  // Always fire MathJax on content change
  useMathJax([post, recentPosts]);

  // Reading time (before any early returns)
  const readingTime = useMemo(() => {
    const words = stripHtml(post?.content || "")
      .split(/\s+/)
      .filter(Boolean).length;
    return Math.max(1, Math.round((words || 200) / 200)); // ~200 wpm
  }, [post?.content]);

  // Fetch data for the page (only if not provided by SSR or if slug changes)
  useEffect(() => {
    if (initialPost && post && post.slug === slug) {
      setLoading(false);
      return;
    }

    let ok = true;
    (async () => {
      try {
        setLoading(true);
        // Scroll to top on navigation
        window.scrollTo({ top: 0, behavior: "instant" });

        const pRes = await api.get(`/posts/${slug}`);
        const rRes = await api.get(`/posts?limit=6`);

        if (!ok) return;

        const currentPost = pRes.data;
        setPost(currentPost);

        const arr = Array.isArray(rRes.data)
          ? rRes.data
          : rRes.data?.posts || [];
        setRecentPosts(arr.filter((p) => p.slug !== slug).slice(0, 5));

        // Also fetch related if not provided
        if (currentPost.category) {
          const relRes = await api.get(`/posts?category=${encodeURIComponent(currentPost.category)}&limit=6`);
          const relData = Array.isArray(relRes.data) ? relRes.data : (relRes.data?.posts || []);
          setRelatedPosts(relData.filter(p => p.slug !== slug).slice(0, 4));
        }

      } catch (e) {
        console.error("Failed to fetch post data", e);
      } finally {
        ok && setLoading(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, [slug, initialPost]);

  // Enhance rendered HTML & build TOC safely
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    // External links → new tab
    root.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;
      try {
        const u = new URL(href, window.location.origin);
        if (u.origin !== window.location.origin) {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        }
      } catch {
        // ignore relative or malformed
      }
    });

    // Images → responsive figure with optional caption
    root.querySelectorAll("img").forEach((img) => {
      img.loading = img.loading || "lazy";
      img.decoding = img.decoding || "async";
      img.classList.add(styles.responsiveImage);

      if (!img.closest("figure")) {
        const fig = document.createElement("figure");
        fig.className = styles.figure;
        img.replaceWith(fig);
        fig.appendChild(img);
        
        // If the image is inside the post content, we try to use its alt or title as caption
        const captionText = img.alt || img.title;
        if (captionText) {
          const cap = document.createElement("figcaption");
          cap.className = styles.figcaption;
          cap.textContent = captionText;
          fig.appendChild(cap);
        }
      }
    });

    // Tables → horizontal scroll on mobile
    root.querySelectorAll("table").forEach((tbl) => {
      if (!tbl.closest(`.${styles.tableWrap}`)) {
        const wrap = document.createElement("div");
        wrap.className = styles.tableWrap;
        tbl.parentNode.insertBefore(wrap, tbl);
        wrap.appendChild(tbl);
      }
      tbl.setAttribute("role", "table");
    });

    // Iframes → 16:9 responsive
    root.querySelectorAll("iframe").forEach((ifr) => {
      if (!ifr.closest(`.${styles.embed}`)) {
        const wrap = document.createElement("div");
        wrap.className = styles.embed;
        ifr.parentNode.insertBefore(wrap, ifr);
        wrap.appendChild(ifr);
      }
      ifr.setAttribute("loading", "lazy");
    });

    // Build TOC from h2/h3 — unique, non-empty IDs only
    const used = new Map();
    const headers = Array.from(root.querySelectorAll("h2, h3"));
    const list = [];
    headers.forEach((h) => {
      const text = (h.textContent || "").trim();
      if (!text) return; // skip empty headings
      let id = (h.id || "").trim();
      if (!id) {
        id = slugifyUnique(text, used);
        if (!id) return; // safety
        h.id = id;
      }
      list.push({ id, text, level: h.tagName === "H2" ? 2 : 3 });
    });

    setToc(list);
  }, [post]);

  if (loading && !post) return <div className={styles.loading}>Loading article…</div>;
  if (!post) return <div className={styles.loading}>Article not found.</div>;

  /* ---------- SEO ---------- */
  const pageUrl = `https://question.maarula.in/articles/${post.slug}`;
  const shareText = `${post.title} - ${pageUrl}`;

  /* ---------- UI ---------- */
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Articles', href: '/articles' },
            { label: post.title }
          ]} 
        />
        {post.category && <p className={styles.category}>{post.category}</p>}
        <h1 className={styles.title}>{post.title}</h1>
        <p className={styles.meta}>
          <span>By Vivek Kumar</span>
          <span className={styles.dot}>•</span>
          <time dateTime={post.createdAt}>
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span className={styles.dot}>•</span>
          <span>{readingTime} min read</span>
        </p>
      </header>

      {post.featuredImage && (
        <figure className={styles.heroFigure}>
          <img
            src={post.featuredImage}
            alt={post.title}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            width="920"
            height="518"
          />
          {post.imageCaption && <figcaption>{post.imageCaption}</figcaption>}
        </figure>
      )}

      {/* Content + Sidebar */}
      <div className={styles.container}>
        <article className={styles.article}>
          {/* Mobile TOC */}
          {toc.length > 0 && (
            <details className={styles.tocMobile}>
              <summary>On this page</summary>
              <nav aria-label="Table of contents">
                <ul>
                  {toc.map((h) => (
                    <li
                      key={h.id}
                      className={h.level === 3 ? styles.tocH3 : styles.tocH2}
                    >
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>
          )}

          <div
            ref={contentRef}
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.videoURL && (
            <section className={styles.videoBlock}>
              <h3 className={styles.h3}>Related Video Explanation</h3>
              <div className={styles.playerWrap}>
                <ReactPlayer
                  url={formatVideoURL(post.videoURL)}
                  className={styles.player}
                  width="100%"
                  height="100%"
                  controls
                />
              </div>
            </section>
          )}

          <div className={styles.share}>
            <span className={styles.shareLead}>
              This information could help a friend — share:
            </span>

            <a
              className={`${styles.social} ${styles.whatsapp}`}
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on WhatsApp"
            >
              <FaWhatsapp />
            </a>

            <a
              className={`${styles.social} ${styles.telegram}`}
              href={`https://t.me/share/url?url=${encodeURIComponent(
                pageUrl
              )}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Telegram"
            >
              <FaTelegram />
            </a>

            <a
              className={`${styles.social} ${styles.facebook}`}
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                pageUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Facebook"
            >
              <FaFacebook />
            </a>

            <a
              className={`${styles.social} ${styles.twitter}`}
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                pageUrl
              )}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on X"
            >
              <FaXTwitter />
            </a>

            <a
              className={`${styles.social} ${styles.linkedin}`}
              href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                pageUrl
              )}&title=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on LinkedIn"
            >
              <FaLinkedin />
            </a>

            <button
              type="button"
              className={`${styles.social} ${styles.copy}`}
              aria-label="Copy link"
              onClick={() => navigator.clipboard.writeText(pageUrl)}
            >
              <FaLink />
            </button>
          </div>

          {/* Related Articles Section */}
          {relatedPosts.length > 0 && (
            <section className={styles.relatedSection}>
              <h3 className={styles.h3}>Related Articles</h3>
              <div className={styles.relatedGrid}>
                {relatedPosts.map(rel => (
                  <Link href={`/articles/${rel.slug}`} key={rel._id} className={styles.relatedCard}>
                    <img 
                      src={rel.featuredImage || FALLBACK_IMAGE} 
                      alt={rel.title} 
                      className={styles.relatedCardImage}
                      loading="lazy"
                    />
                    <div className={styles.relatedCardContent}>
                      <h4 className={styles.relatedCardTitle}>{rel.title}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className={`${styles.sidebar} ${styles.sidebarSticky}`}>
          {toc.length > 0 && (
            <div className={styles.widget}>
              <h3 className={styles.widgetTitle}>On this page</h3>
              <nav aria-label="Table of contents">
                <ul className={styles.tocList}>
                  {toc.map((h) => (
                    <li
                      key={h.id}
                      className={h.level === 3 ? styles.tocH3 : styles.tocH2}
                    >
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          )}

          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>Recent posts</h3>
            <ul className={styles.recentList}>
              {recentPosts.map((r) => (
                <li key={r._id}>
                  <Link href={`/articles/${r.slug}`}
                    className={styles.recentItem}
                  >
                    <span className={styles.recentTitle}>{r.title}</span>
                    <time className={styles.recentDate}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Internal linking widget for SEO */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>Quick Links</h3>
            <ul className={styles.recentList}>
              <li>
                <Link href="/questions" className={styles.recentItem}>
                  <span className={styles.recentTitle}>📚 Question Bank — 17 Years PYQs</span>
                  <span className={styles.recentDate}>NIMCET, CUET PG & More</span>
                </Link>
              </li>
              <li>
                <Link href="/questions?exam=NIMCET" className={styles.recentItem}>
                  <span className={styles.recentTitle}>🎯 NIMCET Previous Year Questions</span>
                  <span className={styles.recentDate}>Practice with solutions</span>
                </Link>
              </li>
              <li>
                <Link href="/questions?exam=CUET PG" className={styles.recentItem}>
                  <span className={styles.recentTitle}>📝 CUET PG Practice Questions</span>
                  <span className={styles.recentDate}>Topic-wise preparation</span>
                </Link>
              </li>
              <li>
                <Link href="/resources" className={styles.recentItem}>
                  <span className={styles.recentTitle}>📄 Download PYQ Papers (PDF)</span>
                  <span className={styles.recentDate}>Free downloads</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className={styles.recentItem}>
                  <span className={styles.recentTitle}>🏫 About Maarula Classes</span>
                  <span className={styles.recentDate}>India's top MCA coaching</span>
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
