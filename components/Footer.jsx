"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUp } from 'lucide-react';
import { FaGooglePlay } from 'react-icons/fa';
import styles from './Footer.module.css';

// Back to Top Button Component
const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    /* PERF: passive listener to avoid blocking main thread during scroll */
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) setIsVisible(true);
      else setIsVisible(false);
    };
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <button
      className={`${styles.backToTopButton} ${isVisible ? styles.showButton : ''}`}
      onClick={scrollToTop}
      aria-label="Go to top"
    >
      <ArrowUp size={24} />
    </button>
  );
};

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <Image 
          src="https://res.cloudinary.com/dwmj6up6j/image/upload/f_auto,q_auto,w_100/v1752683439/maarulalogo_lywhdo.png" 
          alt="Maarula Classes Logo" 
          className={styles.footerLogo}
          width={100}
          height={100}
          loading="lazy"
        />
        <h3 className={styles.footerTitle}>MAARULA CLASSES</h3>
        <p className={styles.footerSubtitle}>MCA Entrance Coaching</p>
      </div>
      
      <div className={styles.footerGrid}>
        <div className={styles.footerColumn}>
          <h4>Quick Links</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/articles">Blog</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
            <li><a href="https://maarula.in/faculty" target="_blank" rel="noopener noreferrer">Faculty</a></li>
          </ul>
        </div>
        <div className={styles.footerColumn}>
          <h4>Exams</h4>
          <ul>
            <li><Link href="/questions?exam=NIMCET">NIMCET</Link></li>
            <li><Link href="/questions?exam=CUET PG">CUET PG</Link></li>
            <li><Link href="/questions?exam=VITMEE">VITMEE</Link></li>
            <li><Link href="/questions?exam=JAMIA">JAMIA</Link></li>
            <li><Link href="/questions?exam=MAH-CET">MAH-CET</Link></li>
          </ul>
        </div>
        <div className={styles.footerColumn}>
          <h4>Free Resources</h4>
          <ul>
            <li><Link href="/questions">Previous Year Papers</Link></li>
            <li><a href="https://maarulaclasses.classx.co.in/test-series" target="_blank" rel="noopener noreferrer">Free Mock Tests</a></li>
            <li><a href="https://www.youtube.com/channel/UCbwZSQOJnn9ZkkT3dTiUCWg" target="_blank" rel="noopener noreferrer">Strategy Videos</a></li>
            <li><a href="https://maarula.in/resources/" target="_blank" rel="noopener noreferrer">Syllabus</a></li>
          </ul>
        </div>
        <div className={styles.footerColumn}>
          <h4>Our Courses</h4>
          <ul>
            <li><a href="https://maarulaclasses.classx.co.in/new-courses" target="_blank" rel="noopener noreferrer">Live Classes</a></li>
            <li><a href="https://maarulaclasses.classx.co.in/test-series" target="_blank" rel="noopener noreferrer">Test Series</a></li>
            <li><a href="https://maarulaclasses.classx.co.in/books" target="_blank" rel="noopener noreferrer">Comprehensive Notes</a></li>
          </ul>
        </div>
      </div>
      
      <div className={styles.appDownloadSection}>
        <div className={styles.appCta}>
            <h4>Download Maarula Mathem App</h4>
            <p>For Seamless learning experience</p>
            <a href="https://play.google.com/store/apps/details?id=com.maarula.classes" target="_blank" rel="noopener noreferrer" className={styles.playStoreButton}>
              <FaGooglePlay size={24} />
              <span>Google Play</span>
            </a>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        {/* HYDRATION: Static year string avoids server/client mismatch at year boundary */}
        <p>© 2026 Maarula Classes. All Rights Reserved.</p>
        <p className={styles.developerCredit}>
          Designed & Developed with ❤️ by{' '}
          <a 
            href="https://vivekducs.is-a.dev/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.developerLink}
          >
            Vivek Kumar
          </a>
          {' | '}
          <a 
            href="https://www.linkedin.com/in/vivekducs" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.developerLink}
          >
            LinkedIn
          </a>
        </p>
      </div>
      <BackToTopButton />
    </footer>
  );
};

export default Footer;