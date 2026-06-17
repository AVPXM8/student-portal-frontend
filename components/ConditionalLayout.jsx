"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { Toaster } from 'react-hot-toast';

/* PERF: Lazy-load non-critical UI — not needed for initial paint or LCP */
const FloatingSocialBar = dynamic(() => import("@/components/FloatingSocialBar"), { ssr: false });
const EarlyBirdPopup = dynamic(() => import("@/components/EarlyBirdPopup"), { ssr: false });

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isTestRoute = pathname === "/test" || pathname?.startsWith("/test/");

  if (isTestRoute) {
    return (
      <main className="main-content-wrapper">
        {children}
        <Toaster position="top-center" reverseOrder={false} />
        {/* <EarlyBirdPopup /> */}
      </main>
    );
  }

  return (
    <>
      <Header />
      <main className="main-content-wrapper">{children}</main>
      <Footer />
      <BottomNav />
      <FloatingSocialBar />
      <Toaster position="top-center" reverseOrder={false} />
      {/* <EarlyBirdPopup /> */}
    </>
  );
}
