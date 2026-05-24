import ClientComp from "./FullPaperViewPage.jsx";
import { getDynamicResources } from "@/utils/pdf";

const SITE_URL = 'https://question.maarula.in';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export const revalidate = 3600; // 1 hour ISR
export const dynamicParams = true; // allow on-demand generation for new dynamic parameters


const SECTION_ORDER = {
  'mathematics': 1,
  'math': 1,
  'quantitative aptitude': 2,
  'aptitude': 2,
  'quants': 2,
  'logical reasoning': 3,
  'reasoning': 3,
  'lr': 3,
  'computer science': 4,
  'computer awareness': 4,
  'computer': 4,
  'english': 5,
  'general english': 5
};

const getSectionWeight = (subjectName) => {
  if (!subjectName) return 99;
  const normalized = subjectName.toLowerCase().trim();
  return SECTION_ORDER[normalized] || 99;
};

export async function generateStaticParams() {
  const dynamicResources = await getDynamicResources();
  const paramsList = [];
  
  Object.entries(dynamicResources).forEach(([exam, data]) => {
    if (data.yearwise?.length) {
      data.yearwise.forEach((paper) => {
        if (paper.year) {
          paramsList.push({
            examName: encodeURIComponent(exam),
            year: encodeURIComponent(paper.year),
          });
        }
      });
    }
  });
  
  return paramsList;
}

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

export default async function Page({ params }) {
  const resolvedParams = await params;

  const { examName, year } = resolvedParams;
  const decodedExam = decodeURIComponent(examName);
  const decodedYear = decodeURIComponent(year);

  let initialQuestions = [];

  try {
    const res = await fetch(
      `${API_BASE}/api/questions/public?exam=${encodeURIComponent(decodedExam)}&year=${decodedYear}&limit=300`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      let fetchedQs = data?.questions || [];
      
      // Sort strategically by subject order as requested by user
      fetchedQs.sort((a, b) => {
        const wA = getSectionWeight(a.subject);
        const wB = getSectionWeight(b.subject);
        if (wA !== wB) return wA - wB;
        // Sub-sort by question number if available
        const numA = parseInt(a.questionNumber) || 0;
        const numB = parseInt(b.questionNumber) || 0;
        return numA - numB;
      });
      initialQuestions = fetchedQs;
    }
  } catch (err) {
    console.error("Failed to fetch questions on server:", err);
  }

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
      <ClientComp initialQuestions={initialQuestions} />
    </>
  );
}

