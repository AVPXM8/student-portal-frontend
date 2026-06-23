import { Outfit } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
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
    default: "Mathem Solvex | India's Best Free MCA Entrance Platform | NIMCET & CUET-PG",
    template: "%s | Mathem Solvex",
  },
  description: "Mathem Solvex is India's best MCA entrance platform for free, developed by Vivek Kumar. Powered by India's No. 1 NIMCET coaching in Kanpur (best for self-study), offering all PYQs with detailed text & video solutions and practice mock tests.",
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
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* SEO: Theme color for mobile browser chrome */}
        <meta name="theme-color" content="#FF5E0E" />
        
        {/* PERF: Google Analytics deferred to lazyOnload — saves ~500ms main-thread blocking */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-18RJ7KXPK4"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            window.gtag = function(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-18RJ7KXPK4', {
              send_page_view: false,
              persistence_title: true
            });
          `}
        </Script>
      </head>
      {/* HYDRATION: Re-added suppressHydrationWarning to body to prevent browser extension mismatches */}
      <body suppressHydrationWarning>
        <Analytics />
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}

