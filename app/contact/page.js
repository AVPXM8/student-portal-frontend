import ClientComp from "./ContactPage.jsx";

const SITE_URL = 'https://question.maarula.in';

export const metadata = {
  title: "Contact Mathem Solvex & Maarula Classes — Kanpur support",
  description: "Get in touch with Maarula Classes, India's No. 1 NIMCET coaching in Kanpur for NIMCET, CUET-PG, and MCA entrance preparation queries.",
  keywords: "contact Maarula Classes, NIMCET coaching Kanpur, mcaentranceexaminations, self study support",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: "Contact Maarula Classes — MCA Entrance Coaching Support",
    description: "Reach out for NIMCET, CUET-PG coaching inquiries. Call +91 99359 65550.",
    url: `${SITE_URL}/contact`,
    type: "website",
    siteName: "Mathem Solvex by Maarula Classes",
  },
  twitter: {
    card: "summary",
    title: "Contact Maarula Classes | NIMCET & MCA Coaching",
    description: "Get in touch for NIMCET, CUET-PG coaching queries.",
  },
};

export const dynamic = "force-static";

export default function Page() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Contact Us" },
    ],
  };

  const localBusinessLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Maarula Classes",
    "url": "https://maarula.in",
    "telephone": "+91-99359-65550",
    "email": "contact@maarula.in",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN",
    },
    "sameAs": [
      "https://www.instagram.com/maarula.classes",
      "https://www.youtube.com/c/MAARULACLASSES",
      "https://www.facebook.com/classes.maarula",
      "https://www.linkedin.com/company/maarulaclasses"
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }} />
      <ClientComp />
    </>
  );
}

