"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import styles from './PDFViewer.module.css';

const PDFViewerDynamic = dynamic(() => import('./PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className={styles.viewerContainer} style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className={styles.loadingOverlay}>
        <div className={styles.spinner}></div>
        <p style={{ marginTop: '1rem', fontWeight: 500 }}>Loading Viewer...</p>
      </div>
    </div>
  )
});

export default function PDFViewerWrapper(props) {
  return <PDFViewerDynamic {...props} />;
}
