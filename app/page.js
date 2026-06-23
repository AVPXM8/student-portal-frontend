import dynamic from "next/dynamic";

const HomeClient = dynamic(() => import("./HomeClient"), { ssr: true });

const SITE_URL = 'https://question.maarula.in';

export const metadata = {
  title: "Mathem Solvex | India's Best Free MCA Entrance Platform | NIMCET & CUET-PG",
  description: "Mathem Solvex is India's best free premium MCA entrance platform, developed by Vivek Kumar. Powered by Maarula Classes—Kanpur's No. 1 NIMCET coaching (best for self-study)—it offers 17+ years of solved PYQs, LaTeX explanations, video solutions, and mock tests without paying massive coaching fees.",
  keywords: "NIMCET PYQ, CUET PG MCA, MCA Entrance Previous Year Questions, Vivek Kumar, Mathem Solvex, NIMCET mock test, CUET PG preparation, mca entrance examinations, best coaching in kanpur, self study",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Mathem Solvex | India's Best Free MCA Entrance Platform",
    description: "Mathem Solvex is India's best free premium MCA entrance platform, developed by Vivek Kumar. Get 17+ years of solved PYQs, LaTeX explanations, video solutions, and mock tests without paying massive coaching fees.",
    url: SITE_URL,
    type: "website",
    siteName: "Mathem Solvex by Vivek Kumar",
    images: [{ url: "https://res.cloudinary.com/dwmj6up6j/image/upload/v1752687380/rqtljy0wi1uzq3itqxoe.png", width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Mathem Solvex | India's Best Free MCA Entrance Platform",
    description: "Mathem Solvex is India's best free premium MCA entrance platform, developed by Vivek Kumar. Get 17+ years of solved PYQs, LaTeX explanations, video solutions, and mock tests without paying massive coaching fees."
  }
};

export default function Page() {
  // JSON-LD schemas for homepage
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Maarula Classes",
    "alternateName": "Mathem Solvex",
    "url": "https://maarula.in",
    "logo": "https://res.cloudinary.com/dwmj6up6j/image/upload/v1752687380/rqtljy0wi1uzq3itqxoe.png",
    "description": "India's No. 1 NIMCET coaching in Kanpur (best for self-study) for NIMCET, CUET-PG, and MCA entrance examinations.",
    "sameAs": [
      "https://www.youtube.com/@maarulaclasses",
      "https://t.me/maarulaclasses"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Mathem Solvex",
    "alternateName": "Maarula Classes Question Bank",
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/questions?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <HomeClient />
    </>
  );
}
