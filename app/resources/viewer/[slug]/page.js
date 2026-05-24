import React from 'react';
import { notFound } from 'next/navigation';
import { getPdfBySlug, getAllPdfs } from '@/utils/pdf';
import PDFViewer from '@/components/PDFViewer/PDFViewerWrapper';
import Link from 'next/link';
import { ArrowLeft, Home, Share2 } from 'lucide-react';
import styles from './ResourceViewerPage.module.css';

export const revalidate = 86400; // 24 hours ISR
export const dynamicParams = true; // allow on-demand generation for new dynamic parameters


export async function generateStaticParams() {
  const allPdfs = await getAllPdfs();
  return allPdfs.map((pdf) => ({
    slug: pdf.slug,
  }));
}


export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pdf = await getPdfBySlug(slug);

  if (!pdf) return { title: 'Resource Not Found' };

  return {
    title: `${pdf.name} - Official PYQ PDF | Mathem Solvex`,
    description: `Access and read the official ${pdf.name} previous year question paper. High-performance viewer with dark mode and reading enhancements.`,
    openGraph: {
      title: `${pdf.name} | Premium Study Resource`,
      description: `Read ${pdf.name} official paper online.`,
      type: 'article',
    }
  };
}

export default async function ResourcePage({ params }) {
  const { slug } = await params;
  const pdf = await getPdfBySlug(slug);

  if (!pdf) {
    notFound();
  }

  const pdfUrl = pdf.isLocal ? `/api/pdf/${slug}` : pdf.url;

  return (
    <div className={styles.pageContainer}>
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOccupationalCredential",
            "name": pdf.name,
            "description": `Official previous year question paper for ${pdf.name}`,
            "educationalLevel": "Post-Graduate",
          }),
        }}
      />

      {/* Breadcrumbs / Header Overlay (Semi-transparent) */}
      <div className={styles.headerOverlay}>
        <div className={styles.navLinks}>
          <Link href="/resources" className={styles.navBtn}>
            <ArrowLeft size={18} /> <span>Back to Resources</span>
          </Link>
          <div className={styles.separator}></div>
          <Link href="/" className={styles.navBtn}>
            <Home size={18} />
          </Link>
        </div>
        <h1 className={styles.documentTitle}>{pdf.name}</h1>
        <div className={styles.actions}>
          <button className={styles.shareBtn} title="Share Resource">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* PDF Viewer Component */}
      <div className={styles.viewerWrapper}>
        <PDFViewer pdfUrl={pdfUrl} title={pdf.name} />
      </div>

      {/* Footer / Mobile Hint */}
      <div className={styles.footerHint}>
        <p>Tip: Use arrow keys to navigate pages • Press Ctrl + for zoom</p>
      </div>
    </div>
  );
}
