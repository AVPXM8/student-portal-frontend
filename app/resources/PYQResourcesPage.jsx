/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import Link from 'next/link';
import { useRouter, useParams, usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import styles from "./PYQResourcesPage.module.css";
import { 
  Download, 
  FileText, 
  ArrowLeft, 
  LayoutGrid, 
  CalendarDays, 
  Search, 
  Sparkles, 
  AlertCircle,
  BookOpen,
  CheckCircle2
} from 'lucide-react';



const PYQResourcesPage = ({ localPdfs = [], dynamicResources = {} }) => {
  const { examName } = useParams();
  const [viewType, setViewType] = useState('yearwise'); // 'yearwise' or 'topicwise'
  const [searchTerm, setSearchTerm] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    console.log('Dynamic Resources Received:', Object.keys(dynamicResources));
    console.log('Local PDFs count:', localPdfs.length);
  }, [dynamicResources, localPdfs]);

  // Load recently viewed from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recently-viewed-pdfs');
    if (saved) {
      try {
        setRecentlyViewed(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recently viewed', e);
      }
    }
  }, []);

  // Extremely direct exam lookup logic
  const decodedExamName = decodeURIComponent(examName || "");
  const keys = Object.keys(dynamicResources);
  const matchedKey = keys.find(key => {
    const k = key.toUpperCase().trim();
    const d = decodedExamName.toUpperCase().trim();
    return k === d || 
           k.replace(/-/g, ' ') === d || 
           k === d.replace(/-/g, ' ') ||
           k.replace(/[- ]/g, '') === d.replace(/[- ]/g, '');
  });
  
  const currentExamData = dynamicResources[matchedKey];
  const formattedExamName = matchedKey || decodedExamName.replace(/-/g, ' ');

  // Auto-switch viewType if one category is empty
  useEffect(() => {
    if (currentExamData) {
      if (currentExamData.yearwise?.length === 0 && currentExamData.topicwise?.length > 0) {
        setViewType('topicwise');
      } else {
        setViewType('yearwise');
      }
    }
  }, [currentExamData]);

  useEffect(() => {
    console.log('Exam:', formattedExamName, 'Dynamic Resources found:', !!currentExamData);
  }, [formattedExamName, currentExamData]);


  // --- 1. LANDING PAGE VIEW (No exam selected) ---
  if (!examName) {
    return (
      <div className={styles.container}>
        <div className={styles.meshGlow}></div>
        <div className={styles.particle1}></div>
        <div className={styles.particle2}></div>
        
        <header className={styles.heroSection}>
          <div className={styles.heroBadge}>
            <div className={styles.pulsePoint}></div>
            <span>Premium Resource Library</span>
          </div>
          <h1 className={styles.heroTitle}>
            Master Your Exam with <span>Official PYQs</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Direct access to official previous year question papers. Verified, categorized, and optimized for your high-performance preparation.
          </p>
        </header>

        {recentlyViewed.length > 0 && (
          <section className={styles.recentSection}>
            <div className={styles.sectionHeader}>
              <Sparkles size={20} className={styles.sparkleIcon} />
              <h2>Continue Reading</h2>
            </div>
            <div className={styles.recentGrid}>
              {recentlyViewed.map((pdf) => (
                <Link href={`/resources/viewer/${pdf.slug}`} key={pdf.slug} className={styles.recentCard}>
                  <div className={styles.recentIcon}><BookOpen size={20} /></div>
                  <div className={styles.recentInfo}>
                    <h3>{pdf.name}</h3>
                    <span>Viewed recently</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
        
        <section className={styles.examGrid}>
          {Object.keys(dynamicResources).map((exam, index) => {
            const data = dynamicResources[exam];
            const totalPapers = (data.yearwise?.length || 0) + (data.topicwise?.length || 0);
            
            return (
              <Link href={`/resources/${exam}`} 
                key={exam} 
                className={styles.pExamCard}
                style={{ '--index': index }}
              >
                <div className={styles.cardAura}></div>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIconWrapper}>
                    <BookOpen size={28} />
                  </div>
                  <span className={styles.verifyBadge}>VERIFIED</span>
                </div>
                <div className={styles.cardBody}>
                  <h2>{exam}</h2>
                  <p>Access specialized year-wise and topic-wise official papers for {exam} preparation.</p>
                  <div className={styles.metaPills}>
                    <span className={styles.pill}><FileText size={12} /> {totalPapers} Resources</span>
                    <span className={styles.pill}><Sparkles size={12} /> Free Access</span>
                  </div>
                </div>
                <div className={styles.cardAction}>
                  <span>Explore Papers</span>
                  <div className={styles.arrowBox}>
                    <ArrowLeft size={16} />
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    );
  }

  // --- 2. DETAIL PAGE VIEW (Exam selected) ---
  if (!currentExamData) {
    return (
      <div className={styles.container}>
         <div className={styles.emptyContainer}>
            <AlertCircle size={48} color="#FF5E0E" />
            <h2>No Resources Found</h2>
            <p>We couldn&apos;t find any local resources for &quot;{formattedExamName}&quot;.</p>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '20px' }}>
              Available Categories: {Object.keys(dynamicResources).join(', ') || 'NONE'}
            </div>
            <Link href="/resources" className={styles.pDownloadBtn} style={{marginTop: '20px'}}>Back to All Exams</Link>
         </div>
      </div>
    );
  }

  const hasYearWise = currentExamData.yearwise?.length > 0;
  const hasTopicWise = currentExamData.topicwise?.length > 0;
  const currentList = currentExamData[viewType] || [];
  const filteredData = currentList.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.meshGlow}></div>
      <div className={styles.particle1}></div>

      {/* Navigation Bar */}
      <div className={styles.topNav}>
        <Link href="/resources" className={styles.backBtn}>
          <ArrowLeft size={18} /> <span>All Exams</span>
        </Link>
        <div className={styles.breadcrumb}>
          <span>Resources</span> / <span className={styles.activeCrumb}>{formattedExamName}</span>
        </div>
      </div>

      <div className={styles.detailHeader}>
        <div className={styles.headerTitleArea}>
          <div className={styles.examTag}>OFFICIAL ARCHIVE</div>
          <h1>{formattedExamName} <span>Resources</span></h1>
          <p>Read official papers for {formattedExamName} in our high-performance viewer.</p>
        </div>
        
        <div className={styles.detailControls}>
           <div className={styles.detailSearch}>
              <Search size={18} className={styles.searchIcon}/>
              <input 
                type="text" 
                placeholder={`Search papers...`} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

          {hasTopicWise && hasYearWise && (
            <div className={styles.modernToggle}>
              <button 
                className={`${styles.mToggleBtn} ${viewType === 'yearwise' ? styles.mActive : ''}`}
                onClick={() => setViewType('yearwise')}
              >
                <CalendarDays size={18} /> <span>Year-wise</span>
              </button>
              <button 
                className={`${styles.mToggleBtn} ${viewType === 'topicwise' ? styles.mActive : ''}`}
                onClick={() => setViewType('topicwise')}
              >
                <LayoutGrid size={18} /> <span>Topic-wise</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.resourceGrid}>
        {filteredData.length > 0 ? (
          filteredData.map((pdf, idx) => (
            <div key={pdf.id} className={styles.premiumPdfCard} style={{'--i': idx}}>
              <div className={styles.pdfInner}>
                <div className={styles.pdfMain}>
                  <div className={styles.pdfVisual}>
                    <div className={styles.pdfIconCircle}>
                      <FileText size={24} />
                    </div>
                    {pdf.isNew && <span className={styles.newIndicator}>NEW</span>}
                  </div>
                  <div className={styles.pdfMeta}>
                      <h3>{pdf.title}</h3>
                      <div className={styles.metaRow}>
                        {pdf.year && (
                          <span className={styles.yearTag}><CalendarDays size={12} /> {pdf.year}</span>
                        )}
                        <span className={styles.verifiedTag}><CheckCircle2 size={12} /> Official PDF</span>
                      </div>
                  </div>
                </div>
                
                <div className={styles.pdfActions}>
                  {pdf.year && (
                    <Link href={`/test?exam=${encodeURIComponent(formattedExamName)}&year=${pdf.year}`} className={styles.pSolveBtn}>
                      <Sparkles size={16} /> <span>Live Test</span>
                    </Link>
                  )}
                  <Link href={`/resources/viewer/${pdf.slug}`} className={styles.pDownloadBtn}>
                    <BookOpen size={18} /> 
                    <span>View Online</span>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIcon}><Search size={48} /></div>
            <h3>No results found</h3>
            <p>Try different keywords or browse other categories.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PYQResourcesPage;