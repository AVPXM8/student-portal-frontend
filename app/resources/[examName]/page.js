import ClientComp from "../PYQResourcesPage.jsx";
import { getDynamicResources, getAllPdfs } from '@/utils/pdf';

const SITE_URL = 'https://question.maarula.in';

export const revalidate = 3600; // 1 hour ISR
export const dynamicParams = true; // allow on-demand generation for new dynamic parameters


export async function generateStaticParams() {
  const dynamicResources = await getDynamicResources();
  return Object.keys(dynamicResources).map((examName) => ({
    examName: encodeURIComponent(examName),
  }));
}

export async function generateMetadata({ params }) {
  const { examName } = await params;
  const decoded = decodeURIComponent(examName);
  const dynamicResources = await getDynamicResources();
  
  // Robust case-insensitive lookup
  const matchedKey = Object.keys(dynamicResources).find(key => {
    const k = key.toUpperCase();
    const d = decoded.toUpperCase();
    return k === d || 
           k.replace(/-/g, ' ') === d || 
           k === d.replace(/-/g, ' ') ||
           k.replace(/[- ]/g, '') === d.replace(/[- ]/g, '');
  });
  
  const data = dynamicResources[matchedKey];
  const displayTitle = matchedKey || decoded;
  const url = `${SITE_URL}/resources/${encodeURIComponent(displayTitle)}`;

  if (!data) return { title: `${displayTitle} Papers | Mathem Solvex` };

  const yearCount = data.yearwise?.length || 0;
  const topicCount = data.topicwise?.length || 0;

  return {
    title: `${displayTitle} Previous Year Papers PDF — Free Download | Mathem Solvex`,
    description: `Download ${yearCount} official ${displayTitle} previous year question papers PDF free. ${topicCount > 0 ? `Plus ${topicCount} topic-wise PDFs. ` : ''}Year-wise and topic-wise solutions for MCA entrance by Maarula Classes.`,
    keywords: `${displayTitle} PYQ PDF, ${displayTitle} previous year papers, ${displayTitle} question paper download, ${displayTitle} MCA entrance`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${displayTitle} PYQ Papers — Free PDF Download`,
      description: `Free PDF downloads for ${displayTitle} MCA entrance exam previous year papers.`,
      url,
      type: "website",
      siteName: "Mathem Solvex by Maarula Classes",
    },
    twitter: {
      card: "summary",
      title: `${displayTitle} PYQ Papers PDF | Mathem Solvex`,
      description: `Download ${displayTitle} previous year papers free.`,
    },
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const decoded = decodeURIComponent(resolvedParams.examName || '');

  // Fetch dynamic resources to pass to ClientComp
  const dynamicResources = await getDynamicResources();
  const localPdfs = await getAllPdfs();

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Resources", "item": `${SITE_URL}/resources` },
      { "@type": "ListItem", "position": 3, "name": `${decoded} Papers` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ClientComp 
        localPdfs={localPdfs}
        dynamicResources={dynamicResources}
      />
    </>
  );
}

