"use client";

import React from 'react';
import { renderMathSSR } from '@/utils/renderMathSSR';

const MathPreview = ({ latexString = '', className = '', style = {} }) => {
  const isAlreadyKaTeX = typeof latexString === 'string' && (latexString.includes('class="katex"') || latexString.includes('class=\'katex\''));

  // Clean the string: remove common HTML artifacts inside LaTeX
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

  return (
    <div
      className={className}
      style={{ whiteSpace: 'pre-wrap', ...style }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MathPreview;

