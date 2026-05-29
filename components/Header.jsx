"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, Menu, X, Phone, Mail } from 'lucide-react';
import { FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from 'react-icons/fa';
import styles from './Header.module.css';

const Header = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    /* PERF: rAF-throttled scroll handler with passive listener to reduce main-thread blocking */
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.contactInfo}>
            <a href="tel:+919935965550"><Phone size={14} /> +91 99359 65550</a>
            <a href="mailto:contact@maarula.in"><Mail size={14} /> contact@maarula.in</a>
          </div>
          <div className={styles.socialIcons}>
            <a href="https://www.instagram.com/maarula.classes" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://www.facebook.com/classes.maarula" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://www.youtube.com/c/MAARULACLASSES" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a>
            <a href="https://www.linkedin.com/company/maarulaclasses" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={styles.mainHeader}>
        <Link href="/" className={styles.logoContainer}>
          <Image 
            /* PERF: Serve via Cloudinary for auto-format — local maarulalogo.png is 237KB for 52px display */
            src="https://res.cloudinary.com/dwmj6up6j/image/upload/f_auto,q_auto,w_80/v1752683439/maarulalogo_lywhdo.png"
            alt="Mathem Solvex Logo" 
            className={styles.logo} 
            /* CLS: Dimensions match CSS (52px height) to prevent layout shift */
            width={52} 
            height={52} 
            style={{ width: "auto" }}
            priority={true}
            fetchPriority="high"
          />
          <div className={styles.brandName}>
            {/* SEO: Use span instead of h2 — heading hierarchy reserved for page content */}
            <span className={styles.brandTitle}>Mathem Solvex</span>
            <span className={styles.brandTagline}>Get the solution of every question</span>
          </div>
        </Link>

        <nav className={styles.desktopNav}>
          <Link href="/" className={pathname === '/' ? styles.active : ''}>Home</Link>

          <div className={styles.dropdown}>
            <Link href="/questions" className={`${styles.dropdownToggle} ${(pathname.startsWith('/questions') || pathname.startsWith('/question')) ? styles.active : ''}`}>Previous Year Questions <ChevronDown size={16} /></Link>
            <div className={styles.dropdownMenu}>
              <Link href="/questions?exam=NIMCET">NIMCET</Link>
              <Link href="/questions?exam=CUET PG">CUET PG</Link>
              <Link href="/questions?exam=JAMIA">JAMIA</Link>
              <Link href="/questions?exam=MAH-CET">MAH-CET</Link>
              <Link href="/questions?exam=AMU">AMU</Link>
              <Link href="/questions?exam=VITMEE">VITMEE</Link>
              <div className={styles.divider}></div>
              <Link href="/resources" className={styles.specialLink}>PYQ Paper Downloads</Link>
              <Link href="/test" className={styles.specialLink}>Practice Paper</Link>
            </div>
          </div>

          <Link href="/articles" className={pathname.startsWith('/articles') ? styles.active : ''}>Latest Update</Link>

          <div className={styles.dropdown}>
            <span className={`${styles.dropdownToggle} ${(pathname.startsWith('/resources') || pathname.startsWith('/results') || pathname.startsWith('/about')) ? styles.active : ''}`}>Resources <ChevronDown size={16} /></span>
            <div className={styles.dropdownMenu}>
              <Link href="/resources" className={styles.highlightLink}>PYQ PDF Downloads</Link>
              <a href="https://maarulaclasses.classx.co.in/new-courses" target="_blank" rel="noopener noreferrer">Our Courses</a>
              <a href="https://maarulaclasses.classx.co.in/test-series" target="_blank" rel="noopener noreferrer">Test Series</a>
              <Link href="/about">About Us</Link>
            </div>
          </div>

          <Link href="/contact" className={pathname === '/contact' ? styles.active : ''}>Contact Us</Link>
        </nav>

        <div className={styles.headerActions}>
          <a href="https://maarulaclasses.classx.co.in/" target="_blank" rel="noopener noreferrer" className={styles.loginButton}>Login</a>
          <button className={styles.hamburger} onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      </header>

      {/* Mobile Navigation */}
      <div className={`${styles.mobileMenuOverlay} ${isMobileMenuOpen ? styles.isOpen : ''}`}>
        <nav className={styles.mobileNav}>
          <Link href="/" className={pathname === '/' ? styles.active : ''} onClick={closeMobileMenu}>Home</Link>
          
          <div className={styles.mobileSectionTitle}>Question Archive</div>
          <Link href="/questions" className={(pathname.startsWith('/questions') || pathname.startsWith('/question')) && !pathname.includes('exam=') ? styles.active : ''} onClick={closeMobileMenu}>Explore All PYQs</Link>
          <Link href="/questions?exam=NIMCET" onClick={closeMobileMenu}>NIMCET</Link>
          <Link href="/questions?exam=CUET PG" onClick={closeMobileMenu}>CUET PG</Link>
          <Link href="/questions?exam=JAMIA" onClick={closeMobileMenu}>JAMIA</Link>
          <Link href="/questions?exam=MAH-CET" onClick={closeMobileMenu}>MAH-CET</Link>
          <Link href="/questions?exam=AMU" onClick={closeMobileMenu}>AMU</Link>
          <Link href="/questions?exam=VITMEE" onClick={closeMobileMenu}>VITMEE</Link>
          
          <div className={styles.mobileSectionTitle}>Downloads & Practice</div>
          <Link href="/resources" className={pathname.startsWith('/resources') ? styles.active : ''} onClick={closeMobileMenu}>PDF Material Downloads</Link>
          <Link href="/test" className={pathname.startsWith('/test') ? styles.active : ''} onClick={closeMobileMenu}>Solve Practice Paper</Link>
          
          <div className={styles.mobileSectionTitle}>Quick Links</div>
          <Link href="/articles" className={pathname.startsWith('/articles') ? styles.active : ''} onClick={closeMobileMenu}>Latest Updates</Link>
          <Link href="/about" className={pathname.startsWith('/about') ? styles.active : ''} onClick={closeMobileMenu}>About Us</Link>
          <a href="https://maarulaclasses.classx.co.in/new-courses" target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu}>Our Premium Courses</a>
          
          <Link href="/contact" className={pathname === '/contact' ? styles.active : ''} onClick={closeMobileMenu}>Contact Support</Link>
        </nav>
      </div>
    </>
  );
};

export default Header;