"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ClassroomSlider.module.css';

const classroomImages = [
  { src: '/maarula_classroom1.jpg', alt: 'Maarula Classroom' },
  { src: '/maarula_classromm2.jpg', alt: 'Maarula Academic Success' },
];

export default function ClassroomSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    /* PERF: Only auto-advance when visible on screen — saves CPU when off-screen */
    const el = containerRef.current;
    if (!el) return;

    let timer = null;
    const startTimer = () => {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % classroomImages.length);
      }, 4000); /* PERF: Increased from 2s to 4s — reduces re-renders by 50% */
    };
    const stopTimer = () => { if (timer) clearInterval(timer); };

    /* A11Y: Respect reduced motion */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return; /* Don't auto-advance if reduced motion is preferred */

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startTimer();
        else stopTimer();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    return () => {
      stopTimer();
      observer.disconnect();
    };
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % classroomImages.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + classroomImages.length) % classroomImages.length);

  return (
    <div className={styles.sliderWrapper} ref={containerRef}>
      <div className={styles.slider} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {classroomImages.map((img, idx) => (
          <div key={idx} className={styles.slide}>
            <Image 
              src={img.src} 
              alt={img.alt} 
              width={600} 
              height={450} 
              className={styles.image}
              /* PERF: Only first image needs priority — second is off-screen */
              loading={idx === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>
      
      {classroomImages.length > 1 && (
        <>
          <button className={`${styles.navBtn} ${styles.prev}`} onClick={prev} aria-label="Previous slide">
            <ChevronLeft size={24} />
          </button>
          <button className={`${styles.navBtn} ${styles.next}`} onClick={next} aria-label="Next slide">
            <ChevronRight size={24} />
          </button>
          <div className={styles.dots}>
            {classroomImages.map((_, idx) => (
              <button 
                key={idx} 
                className={`${styles.dot} ${currentIndex === idx ? styles.activeDot : ''}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

