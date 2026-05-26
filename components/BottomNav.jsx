"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, FileText, Trophy, LayoutGrid, Bell, Users } from 'lucide-react';
import styles from './BottomNav.module.css';

const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'PYQs', icon: BookOpen, href: '/questions' },
    { label: 'Updates', icon: Bell, href: '/articles' },
    { label: 'Resources', icon: LayoutGrid, href: '/resources' },
    { label: 'About', icon: Users, href: '/about' },
  ];

  // Don't show on specific functional pages (like Test Environment) if needed
  if (pathname.startsWith('/test')) return null;

  return (
    /* A11Y: aria-label for screen readers */
    <nav className={styles.bottomNav} aria-label="Main navigation">
      <div className={styles.container}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href)) ||
            (item.href === '/questions' && pathname.startsWith('/question'));
          return (
            <Link key={item.href} href={item.href} className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              /* A11Y: Indicate current page to screen readers */
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon size={22} className={styles.icon} />
              <span className={styles.label}>{item.label}</span>
              {isActive && <div className={styles.indicator} />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
