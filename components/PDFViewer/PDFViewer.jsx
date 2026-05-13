"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  Sun, Moon, BookOpen, Maximize2, Minimize2,
  RefreshCcw, AlertCircle
} from 'lucide-react';
import styles from './PDFViewer.module.css';
import * as gtag from '@/lib/gtag';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

const PDFViewer = ({ pdfUrl, title }) => {

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [theme, setTheme] = useState('light'); // light, dark, sepia
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const pageRefs = useRef([]);

  // Handle resizing and initial width
  useEffect(() => {
    const updateWidth = () => {
      if (scrollAreaRef.current) {
        // Subtract padding (32px = 1rem * 2)
        const width = scrollAreaRef.current.clientWidth - 32;
        setContainerWidth(width);
        
        // Default to 1.0 (fit width) for all devices
        setScale(1.0);
      }
    };

  updateWidth();
  window.addEventListener('resize', updateWidth);
  return () => window.removeEventListener('resize', updateWidth);
}, [isLoading]);

// Save to recently viewed
useEffect(() => {
  if (pdfUrl && title) {
    const slug = pdfUrl.split('/').pop();
    const saved = localStorage.getItem('recently-viewed-pdfs');
    let recent = [];
    if (saved) {
      try {
        recent = JSON.parse(saved);
      } catch (e) { }
    }

    // Remove if already exists and add to front
    recent = recent.filter(item => item.slug !== slug);
    recent.unshift({ slug, name: title, date: new Date().toISOString() });

    // Limit to 4 items
    recent = recent.slice(0, 4);
    localStorage.setItem('recently-viewed-pdfs', JSON.stringify(recent));
  }
}, [pdfUrl, title]);

// Handle intersection observer to update page number on scroll
useEffect(() => {
  if (!numPages) return;

  const options = {
    root: scrollAreaRef.current,
    threshold: 0.3, // Page is considered "active" when 30% is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const pageIndex = parseInt(entry.target.getAttribute('data-page-index'), 10);
        const newPage = pageIndex + 1;
        
        // Track page view if it's a new page
        if (newPage !== pageNumber) {
          gtag.event('pdf_page_view', {
            pdf_name: title,
            page_number: newPage,
            total_pages: numPages
          });
        }
        
        setPageNumber(newPage);
      }
    });
  }, options);

  pageRefs.current.forEach((ref) => {
    if (ref) observer.observe(ref);
  });

  return () => observer.disconnect();
}, [numPages, isLoading]);

const onDocumentLoadSuccess = ({ numPages }) => {
  setNumPages(numPages);
  setIsLoading(false);
  pageRefs.current = new Array(numPages);
  
  // Track PDF Open
  gtag.event('pdf_open', {
    pdf_name: title,
    total_pages: numPages,
    pdf_url: pdfUrl
  });
};

const onDocumentLoadError = (err) => {
  console.error('PDF load error:', err);
  setError('Failed to load PDF. Please try again later.');
  setIsLoading(false);
  
  // Track PDF Error
  gtag.event('pdf_error', {
    pdf_name: title,
    error_message: err.message
  });
};

const changePage = (offset) => {
  const targetPage = Math.max(1, Math.min(pageNumber + offset, numPages || 1));
  const targetElement = pageRefs.current[targetPage - 1];
  if (targetElement) {
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    containerRef.current.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable full-screen mode: ${err.message}`);
    });
    setIsFullscreen(true);
  } else {
    document.exitFullscreen();
    setIsFullscreen(false);
  }
};

const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

// Handle keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') changePage(1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') changePage(-1);
    if (e.ctrlKey && e.key === '+') { e.preventDefault(); zoomIn(); }
    if (e.ctrlKey && e.key === '-') { e.preventDefault(); zoomOut(); }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [numPages, pageNumber]);

// Disable context menu and certain shortcuts to discourage downloads
useEffect(() => {
  const handleContextMenu = (e) => e.preventDefault();
  const handleKeySecurity = (e) => {
    if ((e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'u')) || (e.metaKey && (e.key === 'p' || e.key === 's' || e.key === 'u'))) {
      e.preventDefault();
      alert('Downloading and printing is disabled for this resource.');
    }
  };
  window.addEventListener('contextmenu', handleContextMenu);
  window.addEventListener('keydown', handleKeySecurity);
  return () => {
    window.removeEventListener('contextmenu', handleContextMenu);
    window.removeEventListener('keydown', handleKeySecurity);
  };
}, []);

return (
  <div
    ref={containerRef}
    className={`${styles.viewerContainer} ${styles[theme]}`}
    onContextMenu={(e) => e.preventDefault()}
  >
    {/* Toolbar */}
    <div className={styles.toolbar}>
      <div className={styles.controlsGroup}>
        <button
          className={styles.btn}
          onClick={() => changePage(-1)}
          disabled={pageNumber <= 1}
          title="Previous Page"
        >
          <ChevronLeft size={20} />
        </button>
        <span className={styles.pageIndicator}>
          Page {pageNumber} / {numPages || '--'}
        </span>
        <button
          className={styles.btn}
          onClick={() => changePage(1)}
          disabled={pageNumber >= numPages}
          title="Next Page"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className={styles.controlsGroup}>
        <button className={styles.btn} onClick={zoomOut} title="Zoom Out">
          <ZoomOut size={20} />
        </button>
        <span className={styles.zoomValue}>{Math.round(scale * 100)}%</span>
        <button className={styles.btn} onClick={zoomIn} title="Zoom In">
          <ZoomIn size={20} />
        </button>
      </div>

      <div className={styles.controlsGroup}>
        <button
          className={`${styles.btn} ${theme === 'light' ? styles.activeBtn : ''}`}
          onClick={() => setTheme('light')}
          title="Light Mode"
        >
          <Sun size={20} />
        </button>
        <button
          className={`${styles.btn} ${theme === 'dark' ? styles.activeBtn : ''}`}
          onClick={() => setTheme('dark')}
          title="Dark Mode"
        >
          <Moon size={20} />
        </button>
        <button
          className={`${styles.btn} ${theme === 'sepia' ? styles.activeBtn : ''}`}
          onClick={() => setTheme('sepia')}
          title="Sepia Mode"
        >
          <BookOpen size={20} />
        </button>
        <button className={styles.btn} onClick={toggleFullscreen} title="Fullscreen">
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>
    </div>

    {/* Main Viewer Area */}
    <div className={styles.pdfScrollArea} ref={scrollAreaRef}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p style={{ marginTop: '1rem', fontWeight: 500 }}>Rendering Document...</p>
        </div>
      )}

      {error ? (
        <div className={styles.loadingOverlay}>
          <AlertCircle size={48} color="#ef4444" />
          <p style={{ marginTop: '1rem', color: '#ef4444' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.btn}
            style={{ marginTop: '1rem', background: '#3b82f6', color: 'white', width: 'auto', padding: '0 1rem' }}
          >
            <RefreshCcw size={16} style={{ marginRight: '0.5rem' }} /> Retry
          </button>
        </div>
      ) : (
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className={styles.skeleton}></div>}
        >
          <div className={styles.pagesContainer}>
            {Array.from(new Array(numPages), (el, index) => (
              <div
                key={`page_${index + 1}`}
                ref={el => pageRefs.current[index] = el}
                data-page-index={index}
                className={styles.pdfCanvasWrapper}
              >
                <Page
                  pageNumber={index + 1}
                  width={containerWidth > 0 ? containerWidth * scale : undefined}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                  loading={<div className={styles.skeleton}></div>}
                />
              </div>
            ))}
          </div>
        </Document>
      )}
    </div>
  </div>
);
};

export default PDFViewer;
