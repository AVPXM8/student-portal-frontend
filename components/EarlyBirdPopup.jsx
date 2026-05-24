"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "./EarlyBirdPopup.module.css";

const TOTAL_SEATS = 90;
const DAILY_DECREMENT = 10;
const STORAGE_KEY_SEATS = "earlybird_seats";
const STORAGE_KEY_DATE = "earlybird_last_date";
const STORAGE_KEY_CLOSED = "earlybird_closed";
const CTA_URL =
  "https://maarulaclasses.classx.co.in/test-series/10-nimcet-2026-test-series-udgam";
const COUPON_CODE = "EARLYBIRD90";

function getSeatsRemaining() {
  try {
    const storedDate = localStorage.getItem(STORAGE_KEY_DATE);
    const storedSeats = localStorage.getItem(STORAGE_KEY_SEATS);
    const today = new Date().toDateString();

    if (!storedDate || !storedSeats) {
      localStorage.setItem(STORAGE_KEY_DATE, today);
      localStorage.setItem(STORAGE_KEY_SEATS, String(TOTAL_SEATS));
      return TOTAL_SEATS;
    }

    const daysDiff = Math.floor(
      (new Date(today) - new Date(storedDate)) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff > 0) {
      const newSeats = Math.max(
        0,
        parseInt(storedSeats, 10) - daysDiff * DAILY_DECREMENT
      );
      localStorage.setItem(STORAGE_KEY_DATE, today);
      localStorage.setItem(STORAGE_KEY_SEATS, String(newSeats));
      return newSeats;
    }

    return Math.max(0, parseInt(storedSeats, 10));
  } catch {
    return TOTAL_SEATS;
  }
}

export default function EarlyBirdPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [seats, setSeats] = useState(TOTAL_SEATS);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasClosed = sessionStorage.getItem(STORAGE_KEY_CLOSED);
    setSeats(getSeatsRemaining());
    if (!hasClosed) {
      const t = setTimeout(() => setIsOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, mounted]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    try { sessionStorage.setItem(STORAGE_KEY_CLOSED, "true"); } catch {}
  }, []);

  const handleOverlayClick = useCallback(
    (e) => { if (e.target === e.currentTarget) handleClose(); },
    [handleClose]
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(COUPON_CODE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Early Bird Offer Popup"
    >
      <div className={styles.modal}>
        {/* Close Button */}
        <button
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Close popup"
        >
          ✕
        </button>

        {/* Full Image — no cropping */}
        <div className={styles.imageWrapper}>
          <Image
            src="/earlybird90.jpg"
            alt="NIMCET 2026 UDGAM Early Bird Rank Booster Test Series"
            width={1080}
            height={1080}
            className={styles.heroImage}
            priority
          />
        </div>

        {/* Content below image */}
        <div className={styles.content}>

          {/* Scarcity Counter */}
          <div className={styles.scarcityBox}>
            <span className={styles.scarcityIcon}>⚡</span>
            <div>
              <p className={styles.scarcityMain}>
                Hurry! Only{" "}
                <span className={styles.seatCount}>{seats}</span> seats left
              </p>
              <p className={styles.scarcitySub}>
                Only {TOTAL_SEATS} Early Bird Seats Available
              </p>
            </div>
          </div>

          {/* Coupon Section */}
          <div className={styles.couponSection}>
            <p className={styles.couponLabel}>🎟️ Apply Coupon Code</p>
            <div className={styles.couponRow}>
              <span className={styles.couponCode}>{COUPON_CODE}</span>
              <button
                className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ""}`}
                onClick={handleCopy}
                aria-label="Copy coupon code"
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Offer note */}
          <p className={styles.offerNote}>
            ⏳ Offer valid for limited students only
          </p>

          {/* CTA Button */}
          <a
            href={CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaButton}
            onClick={handleClose}
          >
            <span>Enroll Now</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
