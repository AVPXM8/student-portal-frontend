"use client";

import React, { useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./HomePage.module.css";
import Image from "next/image";
import dynamic from "next/dynamic";

import { students } from '@/data/students';

const SuccessCarousel = dynamic(() => import("../components/SuccessCarousel"), {
  ssr: false,
  loading: () => <div className={styles.skeletonHero} />
});

const AwardCarousel = dynamic(() => import("../components/AwardCarousel"), {
  ssr: false,
  loading: () => <div className={styles.skeleton} />
});

const ClassroomSlider = dynamic(() => import("../components/ClassroomSlider"), {
  ssr: false,
  loading: () => <div className={styles.skeleton} />
});


function RevealSection({ children, className = "", style = {} }) {
  const sectionRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.revealVisible);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <div ref={sectionRef} className={`${styles.reveal} ${className}`} style={style}>
      {children}
    </div>
  );
}

export default function HomeClient() {

  return (
    <div className={styles.homePage}>
      {/* HERO SECTION */}
      <header className={styles.heroSection}>
        <SuccessCarousel />
      </header>

      {/* PRIMARY SEO INTRO */}
      <section className={styles.pyqIntro}>
        <RevealSection className={styles.pyqContent}>
          <h1 className={styles.h1}>
            Master MCA Entrances with <strong>Mathem Solvex</strong>
          </h1>

          <p className={styles.lede}>
            Unlock access to the most comprehensive <strong>Previous Year Questions (PYQ)</strong>, 
            expert-curated <strong>Study Material</strong>, and <strong>Mock Test Series</strong> for 
            NIMCET, CUET PG, and major MCA entrances.
          </p>

          <div className={styles.pyqButtons}>
            <Link href="/questions?exam=NIMCET" className={styles.primaryBtn}>
              Explore NIMCET PYQs
            </Link>
            <Link href="/questions?exam=CUET PG" className={styles.secondaryBtn}>
              Take Mock Test
            </Link>
          </div>

          <div className={styles.chipRow}>
            <Link href="/questions?exam=NIMCET&year=2024" className={styles.chip}>NIMCET 2024</Link>
            <Link href="/questions?exam=CUET PG&year=2024" className={styles.chip}>CUET PG 2024</Link>
            <Link href="/questions?exam=NIMCET&subject=Mathematics" className={styles.chip}>Mathematics</Link>
            <Link href="/questions?exam=CUET PG&subject=Reasoning" className={styles.chip}>Reasoning</Link>
            <Link href="/articles" className={styles.chip}>Practice Tips</Link>
          </div>
        </RevealSection>
      </section>

      {/* STATS COUNTER SECTION */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <RevealSection className={styles.statBox}>
            <span className={styles.statNumber}>1000+</span>
            <span className={styles.statLabel}>Selections</span>
          </RevealSection>
          <RevealSection className={styles.statBox} style={{ transitionDelay: '0.1s' }}>
            <span className={styles.statNumber}>5000+</span>
            <span className={styles.statLabel}>Solved PYQs</span>
          </RevealSection>
          <RevealSection className={styles.statBox} style={{ transitionDelay: '0.2s' }}>
            <span className={styles.statNumber}>200+</span>
            <span className={styles.statLabel}>Mock Tests</span>
          </RevealSection>
          <RevealSection className={styles.statBox} style={{ transitionDelay: '0.3s' }}>
            <span className={styles.statNumber}>12+</span>
            <span className={styles.statLabel}>Years Excellence</span>
          </RevealSection>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className={styles.featuresSection}>
        <RevealSection className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Why Choose Mathem Solvex?</h2>
          <p className={styles.sectionSubtitle}>Designed for success, built for MCA aspirants.</p>
        </RevealSection>
        
        <div className={styles.featuresGrid}>
          <RevealSection className={styles.featureCard}>
            <h3>Expert Solutions</h3>
            <p>Step-by-step verified explanations and video solutions for every complex problem.</p>
            <Link href="/questions" className={styles.featureLink}>Browse Questions →</Link>
          </RevealSection>
          <RevealSection className={styles.featureCard} style={{ transitionDelay: '0.1s' }}>
            <h3>Topic-wise Filter</h3>
            <p>Target your weak areas by filtering questions by subject, topic, year, and difficulty.</p>
            <Link href="/questions?exam=NIMCET&subject=Mathematics" className={styles.featureLink}>Try Filtering →</Link>
          </RevealSection>
          <RevealSection className={styles.featureCard} style={{ transitionDelay: '0.2s' }}>
            <h3>Real Exam Interface</h3>
            <p>Practice in an environment that mimics the actual exam to build speed and confidence.</p>
            <Link href="/test?exam=NIMCET&subject=Mathematics&topic=Calculus&limit=20" className={styles.featureLink}>Start Practice Test →</Link>
          </RevealSection>
        </div>
      </section>

      {/* HALL OF FAME */}
      <section className={styles.awardSection}>
        <RevealSection className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Our Hall of Fame</h2>
          <p className={styles.sectionSubtitle}>Celebrating the excellence of our top-ranking students.</p>
        </RevealSection>
        
        <AwardCarousel />

        <div className={styles.viewAllContainer}>
          <Link href="/results" className={styles.viewAllButton}>
            View Full Results (2023–2025) →
          </Link>
        </div>
      </section>


      {/* ABOUT MAARULA */}
      <section className={styles.introSection}>
        <RevealSection className={styles.introContent}>
          <h2 className={styles.mainTitle}>
            India’s Premier NIMCET & MCA Entrance Coaching
          </h2>
          <p className={styles.introText}>
            For over a decade, <strong>Maarula Classes</strong> has been the standard-bearer 
            for MCA entrance preparation. Our results speak for themselves.
          </p>
          <ul className={styles.introHighlights}>
            <li>Subject-wise expert faculty mentoring</li>
            <li>In-depth conceptual clarity & shortcut tricks</li>
            <li>The most rigorous mock test series</li>
          </ul>
          <a href="https://maarula.in/" target="_blank" rel="noopener noreferrer" className={styles.primaryBtn}>
            Learn More About Maarula
          </a>
        </RevealSection>

        <RevealSection className={styles.introImageContainer}>
          <ClassroomSlider />
        </RevealSection>
      </section>
    </div>
  );
}
