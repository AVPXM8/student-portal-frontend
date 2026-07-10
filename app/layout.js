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
  description: "Mathem Solvex is India's best free premium MCA entrance preparation platform, developed by Vivek Kumar. Powered by Maarula Classes—Kanpur's No. 1 NIMCET coaching (best for self-study)—it provides 17+ years of solved PYQs, step-by-step LaTeX explanations, video solutions, and mock tests without paying massive coaching fees.",
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
        <Script id="register-sw" strategy="lazyOnload">
          {`
            if ('serviceWorker' in navigator) {
              // Clean up other service workers registered on this origin (e.g. from previous projects running on the same port)
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for (let registration of registrations) {
                  const worker = registration.active || registration.waiting || registration.installing;
                  if (worker && !worker.scriptURL.endsWith('/sw.js')) {
                    registration.unregister().then(function() {
                      console.log('Unregistered conflict-causing service worker:', worker.scriptURL);
                      // Force reload to get clean state
                      window.location.reload();
                    });
                  }
                }
              });

              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                  console.log('Service Worker registered successfully with scope: ', reg.scope);
                }).catch(function(err) {
                  console.error('Service Worker registration failed: ', err);
                });
              });
            }
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

