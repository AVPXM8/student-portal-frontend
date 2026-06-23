/**
 * Server-side math rendering using KaTeX.
 * This module runs ONLY on the server (Node.js) and produces static HTML
 * that is crawlable by search engines without JavaScript.
 *
 * Supported delimiters:
 *  - Inline:  $...$  and  \(...\)
 *  - Display: $$...$$ and  \[...\]
 */

import katex from 'katex';
import { marked } from 'marked';

const KATEX_OPTS_INLINE = {
  throwOnError: false,
  displayMode: false,
  output: 'html',
  trust: false,
};

const KATEX_OPTS_DISPLAY = {
  throwOnError: false,
  displayMode: true,
  output: 'html',
  trust: false,
};

/**
 * Render a single LaTeX expression with KaTeX.
 * Returns the KaTeX HTML string, or the raw expression on failure.
 */
function renderLatex(latex, displayMode) {
  try {
    return katex.renderToString(latex.trim(), displayMode ? KATEX_OPTS_DISPLAY : KATEX_OPTS_INLINE);
  } catch {
    return latex;
  }
}

/**
 * Replace all LaTeX delimiters in an HTML string with pre-rendered KaTeX HTML.
 * Order matters: process $$ before $ to avoid greedy matches.
 *
 * @param {string} html - Raw content string (may contain HTML + LaTeX)
 * @returns {string} HTML with all math expressions replaced by KaTeX output
 */
export function renderMathSSR(html = '') {
  if (!html || typeof html !== 'string') return html || '';

  let result = html;

  // 1. Display math: \[...\]
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, tex) =>
    renderLatex(tex, true)
  );

  // 2. Display math: $$...$$  (must come before single $)
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) =>
    renderLatex(tex, true)
  );

  // 3. Inline math: \(...\)
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, tex) =>
    renderLatex(tex, false)
  );

  // 4. Inline math: $...$  (non-greedy, no newlines to avoid matching prose)
  result = result.replace(/\$([^\n$]+?)\$/g, (_, tex) =>
    renderLatex(tex, false)
  );

  return result;
}

/**
 * Strip all HTML tags and LaTeX delimiters, returning plain text.
 * Used for JSON-LD and meta description generation.
 */
export function toPlainTextSSR(s = '') {
  return s
    .replace(/<\/(td|th|tr|p|div|h[1-6]|li)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^\n$]+?\$/g, ' ')
    .replace(/\\\[[\s\S]*?\\\]/g, ' ')
    .replace(/\\\([\s\S]*?\\\)/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses markdown (including headings down to h6, blockquotes, code, tables, bold, italics) and
 * renders KaTeX mathematical formulas (delimiters: $$, \[, \], $, \() to clean, premium HTML.
 * Resolves mathematical delimiters before parsing markdown to avoid style corruption inside math.
 *
 * @param {string} markdown - Input markdown string with optional LaTeX formulas
 * @returns {string} HTML with rendered markdown and KaTeX equations
 */
export function renderMarkdownAndMath(markdown = '') {
  if (!markdown || typeof markdown !== 'string') return markdown || '';

  const mathBlocks = [];

  // Pre-process: normalize escaped dollar signs to raw dollar signs for flawless matching and rendering
  let text = markdown.replace(/\\(\$)/g, '$1');

  // Display math $$...$$
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
    try {
      const html = katex.renderToString(tex.trim(), {
        throwOnError: false,
        displayMode: true,
        output: 'html',
        trust: false,
      });
      mathBlocks.push(html);
    } catch {
      mathBlocks.push(tex);
    }
    return `@@MATH_PLACEHOLDER_${mathBlocks.length - 1}@@`;
  });

  // Display math \[...\]
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, tex) => {
    try {
      const html = katex.renderToString(tex.trim(), {
        throwOnError: false,
        displayMode: true,
        output: 'html',
        trust: false,
      });
      mathBlocks.push(html);
    } catch {
      mathBlocks.push(tex);
    }
    return `@@MATH_PLACEHOLDER_${mathBlocks.length - 1}@@`;
  });

  // Inline math \(...\)
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, tex) => {
    try {
      const html = katex.renderToString(tex.trim(), {
        throwOnError: false,
        displayMode: false,
        output: 'html',
        trust: false,
      });
      mathBlocks.push(html);
    } catch {
      mathBlocks.push(tex);
    }
    return `@@MATH_PLACEHOLDER_${mathBlocks.length - 1}@@`;
  });

  // Inline math $...$ (non-greedy, no newlines)
  text = text.replace(/\$([^\n$]+?)\$/g, (_, tex) => {
    try {
      const html = katex.renderToString(tex.trim(), {
        throwOnError: false,
        displayMode: false,
        output: 'html',
        trust: false,
      });
      mathBlocks.push(html);
    } catch {
      mathBlocks.push(tex);
    }
    return `@@MATH_PLACEHOLDER_${mathBlocks.length - 1}@@`;
  });

  // 2. Parse Markdown using the robust, standard `marked` library
  let finalHtml = '';
  try {
    // Configure marked options to preserve newlines and utilize Github Flavored Markdown
    finalHtml = marked.parse(text, {
      breaks: true,
      gfm: true
    });
  } catch (err) {
    console.error("Marked parsing error in renderMarkdownAndMath:", err);
    finalHtml = text;
  }

  // 3. Restore the math placeholders with pre-rendered KaTeX HTML
  mathBlocks.forEach((mathHtml, index) => {
    finalHtml = finalHtml.replaceAll(`@@MATH_PLACEHOLDER_${index}@@`, mathHtml);
  });

  return finalHtml;
}

