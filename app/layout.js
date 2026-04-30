import { Outfit } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import ConditionalLayout from "@/components/ConditionalLayout";
import Analytics from "@/components/Analytics";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: {
    default: "Mathem Solvex | NIMCET & CUET-PG PYQ Bank",
    template: "%s | Mathem Solvex",
  },
  description: "Access 10+ years of NIMCET, CUET-PG, and MCA entrance PYQs with expert video solutions.",
  metadataBase: new URL("https://question.maarula.in"),
  openGraph: {
    siteName: "Mathem Solvex",
    type: "website",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  robots: { index: true, follow: true },
  verification: {
    google: "dyhhcuWG_4e0cByNd_RKXKsAldmz2g0kcK2a_yCKvlE",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <head>
        {/* Speed up external resources */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        <Script id="mathjax-config" strategy="beforeInteractive">
          {`
            window.MathJax = {
              tex: {
                inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
                processEscapes: true
              },
              svg: {
                fontCache: 'global'
              }
            };
          `}
        </Script>
        <Script 
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
          strategy="beforeInteractive"
        />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-18RJ7KXPK4"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-18RJ7KXPK4', {
              send_page_view: false,
            });
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <Analytics />
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
