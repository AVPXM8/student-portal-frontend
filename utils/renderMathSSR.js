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
 * Parses simple markdown (headings, lists, bold, italics, code) and renders KaTeX mathematical
 * formulas (delimiters: $$, \[, \], $, \() to clean, premium HTML.
 * Resolves mathematical delimiters before parsing markdown to avoid style corruption inside math.
 *
 * @param {string} markdown - Input markdown string with optional LaTeX formulas
 * @returns {string} HTML with rendered markdown and KaTeX equations
 */
export function renderMarkdownAndMath(markdown = '') {
  if (!markdown || typeof markdown !== 'string') return markdown || '';

  const mathBlocks = [];

  // 1. Extract and pre-render LaTeX math to avoid markdown parsing inside math expressions
  let text = markdown;

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

  // 2. Parse Markdown blocks line-by-line
  const lines = text.split('\n');
  let htmlResult = [];
  let inList = false;
  let listType = null; // 'ul' or 'ol'

  const closeListIfNeeded = () => {
    if (inList) {
      htmlResult.push(`</${listType}>`);
      inList = false;
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      closeListIfNeeded();
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      closeListIfNeeded();
      htmlResult.push(`<h3>${inlineStyles(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      closeListIfNeeded();
      htmlResult.push(`<h2>${inlineStyles(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      closeListIfNeeded();
      htmlResult.push(`<h1>${inlineStyles(trimmed.slice(2))}</h1>`);
      continue;
    }

    // Unordered lists
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.*)/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        closeListIfNeeded();
        htmlResult.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      htmlResult.push(`<li>${inlineStyles(ulMatch[2])}</li>`);
      continue;
    }

    // Ordered lists
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        closeListIfNeeded();
        htmlResult.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      htmlResult.push(`<li>${inlineStyles(olMatch[2])}</li>`);
      continue;
    }

    // Otherwise, it's a regular text block/paragraph line
    closeListIfNeeded();
    
    // Look ahead to see if the next lines are also paragraph text
    let paragraphContent = inlineStyles(trimmed);
    while (i + 1 < lines.length && lines[i + 1].trim() !== '' && 
           !lines[i + 1].trim().startsWith('#') && 
           !/^(\s*)[-*+]\s+/.test(lines[i + 1]) && 
           !/^(\s*)\d+\.\s+/.test(lines[i + 1])) {
      i++;
      paragraphContent += '<br />' + inlineStyles(lines[i].trim());
    }
    htmlResult.push(`<p>${paragraphContent}</p>`);
  }

  closeListIfNeeded();

  let finalHtml = htmlResult.join('\n');

  // 3. Restore the math placeholders with pre-rendered KaTeX HTML
  mathBlocks.forEach((mathHtml, index) => {
    finalHtml = finalHtml.replaceAll(`@@MATH_PLACEHOLDER_${index}@@`, mathHtml);
  });

  return finalHtml;
}

function inlineStyles(text) {
  if (!text) return '';
  return text
    // Escape standard text characters that might break HTML but keep our placeholders clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Restore raw characters within math placeholders
    .replace(/@@MATH_PLACEHOLDER_(\d+)@@/g, (_, index) => `@@MATH_PLACEHOLDER_${index}@@`)
    // Bold: **text**
    .replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text*
    .replace(/\*([\s\S]+?)\*/g, '<em>$1</em>')
    // Inline code: `code`
    .replace(/`([\s\S]+?)`/g, '<code>$1</code>');
}

