"use client";

import { useEffect, useRef } from 'react';

const useMathJax = (dependencies, containerRef) => {
  const retryRef = useRef(null);

  useEffect(() => {
    if (retryRef.current) clearTimeout(retryRef.current);

    const typeset = () => {
      if (typeof window?.MathJax?.typesetPromise === 'function') {
        const elements = containerRef && containerRef.current ? [containerRef.current] : undefined;
        
        // Clear if we have new content to avoid double typesetting issues
        if (elements && window.MathJax.typesetClear) {
          try { window.MathJax.typesetClear(elements); } catch(e) {}
        }
        
        // Ensure MathJax is ready before calling typesetPromise
        const startupPromise = window.MathJax.startup?.promise || Promise.resolve();
        
        startupPromise.then(() => {
          return window.MathJax.typesetPromise(elements);
        }).catch((err) => {
          console.log('MathJax typeset failed: ', err);
        });
      } else {
        // MathJax not loaded yet — retry
        retryRef.current = setTimeout(typeset, 500);
      }
    };

    // Small delay to let DOM paint first
    const id = setTimeout(typeset, 50);
    return () => {
      clearTimeout(id);
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [JSON.stringify(dependencies), containerRef]);
};

export default useMathJax;