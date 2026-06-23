import ClientComp from "./AboutPage.jsx";

const SITE_URL = 'https://question.maarula.in';

export const metadata = {
  title: "About Mathem Solvex & Maarula Classes — India's No.1 NIMCET Coaching in Kanpur",
  description: "Learn about Mathem Solvex, India's best free premium MCA entrance preparation platform, developed by Vivek Kumar and powered by Maarula Classes—Kanpur's No. 1 NIMCET coaching (best for self-study)—for high-performance prep without high fees.",
  keywords: "Maarula Classes, NIMCET coaching, CUET PG coaching, mcaentranceexaminations, Vivek Kumar, self study",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About Maarula Classes — India's Top MCA Entrance Coaching",
    description: "Learn about Maarula Classes, India's premier coaching institute for NIMCET, CUET-PG, and MCA entrance exams.",
    url: `${SITE_URL}/about`,
    type: "website",
    siteName: "Mathem Solvex by Maarula Classes",
    images: [{ url: "https://res.cloudinary.com/dwmj6up6j/image/upload/v1752687380/rqtljy0wi1uzq3itqxoe.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Maarula Classes — India's Top MCA Entrance Coaching",
    description: "10+ years of excellence in NIMCET, CUET-PG & MCA entrance preparation.",
  },
};

export const dynamic = "force-static";

export default function Page() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "About Us" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ClientComp />
    </>
  );
}

