"use client";

import React from 'react';
import useMathJax from '@/hooks/useMathJax';
import { renderMathSSR } from '@/utils/renderMathSSR';

const MathPreview = ({ latexString = '', className = '', style = {} }) => {
  // Guard: don’t let MathJax mutate during the very first paint
  const [mounted, setMounted] = React.useState(false);
  const containerRef = React.useRef(null);
  React.useEffect(() => setMounted(true), []);

  const isAlreadyKaTeX = typeof latexString === 'string' && (latexString.includes('class="katex"') || latexString.includes('class=\'katex\''));

  // Clean the string: MathJax 3 hates &nbsp; and some other HTML artifacts inside LaTeX
  const cleaned = React.useMemo(() => {
    if (!latexString) return '';
    let strToClean = typeof latexString === 'string' ? latexString : String(latexString || '');
    if (typeof latexString === 'object') strToClean = latexString.text || '';
    
    if (isAlreadyKaTeX) {
      return strToClean; // Return exact HTML from backend to avoid corrupting KaTeX elements
    }

    return strToClean
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/<br\s*\/?>/gi, '\n');
  }, [latexString, isAlreadyKaTeX]);

  const htmlContent = React.useMemo(() => {
    if (!cleaned) return '';
    if (isAlreadyKaTeX) return cleaned;
    return renderMathSSR(cleaned);
  }, [cleaned, isAlreadyKaTeX]);

  useMathJax(!isAlreadyKaTeX ? [cleaned] : [], containerRef);

  return (
    <div
      ref={containerRef}
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MathPreview;
