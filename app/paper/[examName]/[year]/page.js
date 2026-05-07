import ClientComp from "./FullPaperViewPage.jsx";

const SITE_URL = 'https://question.maarula.in';

export async function generateMetadata({ params }) {
  const { examName, year } = await params;
  const decodedExam = decodeURIComponent(examName);
  const decodedYear = decodeURIComponent(year);

  const displayExam = decodedExam;
  const url = `${SITE_URL}/paper/${encodeURIComponent(displayExam)}/${decodedYear}`;

  return {
    title: `${displayExam} ${decodedYear} Full Paper — Solve Online | Mathem Solvex`,
    description: `Attempt the complete ${displayExam} ${decodedYear} previous year question paper online in exam-like interface. Practice all questions with solutions on Mathem Solvex by Maarula Classes.`,
    keywords: `${displayExam} ${decodedYear} paper, ${displayExam} previous year paper online, ${displayExam} PYQ practice, MCA entrance mock test`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${displayExam} ${decodedYear} Full Paper — Solve Online`,
      description: `Practice the complete ${displayExam} ${decodedYear} paper in exam mode with solutions.`,
      url,
      type: "website",
      siteName: "Mathem Solvex by Maarula Classes",
    },
    twitter: {
      card: "summary",
      title: `${displayExam} ${decodedYear} Paper | Mathem Solvex`,
      description: `Solve the full ${displayExam} ${decodedYear} paper online with solutions.`,
    },
  };
}

export default async function Page({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const { examName, year } = resolvedParams;
  const decodedExam = decodeURIComponent(examName);
  const decodedYear = decodeURIComponent(year);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Resources", "item": `${SITE_URL}/resources` },
      { "@type": "ListItem", "position": 3, "name": `${decodedExam} Papers`, "item": `${SITE_URL}/resources/${encodeURIComponent(decodedExam)}` },
      { "@type": "ListItem", "position": 4, "name": `${decodedYear} Paper` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ClientComp params={resolvedParams} searchParams={resolvedSearchParams} />
    </>
  );
}
