"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import FloatingSocialBar from "@/components/FloatingSocialBar";
import { Toaster } from 'react-hot-toast';
import EarlyBirdPopup from "@/components/EarlyBirdPopup";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isTestRoute = pathname === "/test" || pathname?.startsWith("/test/");

  if (isTestRoute) {
    return (
      <main className="main-content-wrapper">
        {children}
        <Toaster position="top-center" reverseOrder={false} />
        <EarlyBirdPopup />
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
      <EarlyBirdPopup />
    </>
  );
}
