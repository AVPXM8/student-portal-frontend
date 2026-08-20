import React from 'react';
import Image from 'next/image';
import styles from './Loading.module.css';

export default function Loading() {
  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.logoContainer}>
        <div className={styles.pulsingCircle} />
        <div className={styles.pulsingCircleDelayed} />
        <div className={styles.loaderLogo}>
          <Image 
            src="/maarulalogo.png" 
            alt="Loading Mathem Solvex..." 
            width={80} 
            height={80}
            priority
          />
        </div>
      </div>
      
      <div className={styles.loadingText}>
        Preparing for Excellence
        <span className={styles.dot}>.</span>
        <span className={styles.dot}>.</span>
        <span className={styles.dot}>.</span>
      </div>
      
      <div className={styles.progressBar}>
        <div className={styles.progressFill} />
      </div>
    </div>
  );
}
