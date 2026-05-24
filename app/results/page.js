import ClientComp from "./ResultsPage.jsx";

const SITE_URL = 'https://question.maarula.in';

export const metadata = {
  title: "Student Results & Success Stories | NIMCET & CUET-PG Toppers | Maarula Classes",
  description: "See the proven track record of Maarula Classes. Our students consistently top NIMCET, CUET-PG & MCA entrance exams with AIR ranks. 1000+ selections in top NITs and central universities.",
  keywords: "NIMCET toppers, CUET PG results, MCA entrance results, Maarula Classes results, NIMCET AIR ranks",
  alternates: {
    canonical: `${SITE_URL}/results`,
  },
  openGraph: {
    title: "Student Results — NIMCET & CUET-PG Toppers | Maarula Classes",
    description: "1000+ selections in top NITs. See how Maarula Classes students dominate MCA entrance exams.",
    url: `${SITE_URL}/results`,
    type: "website",
    siteName: "Mathem Solvex by Maarula Classes",
    images: [{ url: "https://res.cloudinary.com/dwmj6up6j/image/upload/v1752687380/rqtljy0wi1uzq3itqxoe.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NIMCET & CUET-PG Toppers | Maarula Classes Results",
    description: "1000+ MCA entrance selections. See our proven track record.",
  },
};

export const dynamic = "force-static";

export default function Page() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Results" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ClientComp />
    </>
  );
}

