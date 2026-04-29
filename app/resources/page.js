import ClientComp from "./PYQResourcesPage.jsx";
import { getDynamicResources, getAllPdfs } from '@/utils/pdf';

const SITE_URL = 'https://question.maarula.in';

export const metadata = {
  title: "Download NIMCET, CUET-PG & MCA Entrance PYQ Papers PDF | Mathem Solvex",
  description: "Free PDF downloads of official previous year question papers for NIMCET, CUET PG, JAMIA, MAH-CET, AMU, WB-JECA & VITMEE. Year-wise and topic-wise papers with solutions by Maarula Classes.",
  keywords: "NIMCET PYQ PDF, CUET PG previous year papers, MCA entrance question papers download, NIMCET papers free download, CUET PG papers PDF",
  alternates: {
    canonical: `${SITE_URL}/resources`,
  },
  openGraph: {
    title: "Download MCA Entrance PYQ Papers PDF Free | Mathem Solvex",
    description: "Free official previous year question papers PDF for NIMCET, CUET PG, JAMIA, MAH-CET, AMU & more MCA entrances.",
    url: `${SITE_URL}/resources`,
    type: "website",
    siteName: "Mathem Solvex by Maarula Classes",
    images: [{ url: "https://res.cloudinary.com/dwmj6up6j/image/upload/v1752687380/rqtljy0wi1uzq3itqxoe.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Download MCA Entrance PYQ Papers PDF | Mathem Solvex",
    description: "Free PDF downloads for NIMCET, CUET PG & all MCA entrance previous year papers.",
  },
};

export default async function Page({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Dynamically build the resource data from the /data/pyqPdf folder
  const dynamicResources = await getDynamicResources();
  const localPdfs = await getAllPdfs();

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "PYQ Resources" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ClientComp 
        params={resolvedParams} 
        searchParams={resolvedSearchParams} 
        localPdfs={localPdfs} 
        dynamicResources={dynamicResources}
      />
    </>
  );
}
