"use client";

import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { students, placements } from '@/data/students';
import styles from './ResultsPage.module.css';

// Reuse StudentCard logic if needed, but here's a dedicated ResultCard for the grid
const ResultCard = ({ student, isPlacement }) => {
  const imageUrl = student.photoUrl || student.imageUrl || '/maarulalogo.png';
  return (
    <div className={`${styles.studentCard} ${isPlacement ? styles.isPlacements : ''}`}>
      <div className={styles.cardMedia}>
        <Image
          src={imageUrl}
          alt={student.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          loading="lazy"
        />
      </div>
      <div className={styles.studentInfo}>
        <h3>{student.name}</h3>
        {student.achievement && <span>{student.achievement}</span>}
        <div className={isPlacement ? styles.placementTag : styles.examTag}>
          {isPlacement ? 'Placed' : (student.exam || 'NIMCET')}
        </div>
        {student.year && <div className={styles.yearBadge}>{student.year}</div>}
      </div>
    </div>
  );
};

const ResultsPage = () => {
  const [activeTab, setActiveTab] = useState('2026');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    let list = [];
    if (activeTab === 'placements') {
      list = placements;
    } else {
      list = students.filter(s => s.year === parseInt(activeTab));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return list.filter(s => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [activeTab, searchQuery]);

  const stats = useMemo(() => ({
    '2026': students.filter(s => s.year === 2026).length,
    '2025': students.filter(s => s.year === 2025).length,
    '2024': students.filter(s => s.year === 2024).length,
    '2023': students.filter(s => s.year === 2023).length,
    'placements': placements.length
  }), []);

  const tabs = [
    { id: '2026', label: '2026 Achievers', count: stats['2026'] },
    { id: '2025', label: '2025 Achievers', count: stats['2025'] },
    { id: '2024', label: '2024 Achievers', count: stats['2024'] },
    { id: '2023', label: '2023 Achievers', count: stats['2023'] },
    { id: 'placements', label: 'Placements', icon: '💼', count: stats['placements'] }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <h1>Our Stellar Results</h1>
        <p>Witness the journey of excellence at Maarula Classes.</p>
      </header>

      <div className={styles.controlsRow}>
        <div className={styles.tabsContainer}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
              aria-selected={activeTab === tab.id}
            >
              {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
              {tab.label}
              <span className={styles.countBadge}>{tab.count}</span>
            </button>
          ))}
        </div>

        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input 
            type="text" 
            placeholder="Search student name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.resultsGrid}>
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, idx) => (
            <ResultCard 
              key={`${student.name}-${idx}`} 
              student={student} 
              isPlacement={activeTab === 'placements'} 
            />
          ))
        ) : (
          <div className={styles.emptyNote}>
            <h3>No records found for this category yet.</h3>
            <p>New results are being updated daily. Stay tuned!</p>
          </div>
        )}
      </div>

      <footer className={styles.linksRow}>
        <a href="https://maarulaclasses.classx.co.in/new-courses" className={styles.linkPill}>Join Our 2026 Batch</a>
        <a href="https://wa.me/919935965550" className={styles.linkPill} target="_blank" rel="noopener">Contact For Admission</a>
      </footer>
    </div>
  );
};

export default ResultsPage;
