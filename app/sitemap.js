import { getDynamicResources } from "@/utils/pdf";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const SITE_URL = 'https://question.maarula.in';

export const revalidate = 86400; // 24 hours ISR sitemap cache

export default async function sitemap() {
  const dynamicResources = await getDynamicResources();
  // Static pages
  const staticRoutes = [
    { url: `${SITE_URL}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/questions`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/articles`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/resources`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/results`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  let questionRoutes = [];
  let postRoutes = [];

  try {
    const res = await fetch(`${API_BASE}/api/sitemap-urls`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const data = await res.json();

      // Question pages (limit to top 1000 latest/popular to save crawl budget)
      if (data.questions?.length) {
        questionRoutes = data.questions.slice(0, 1000).map((q) => ({
          url: `${SITE_URL}/question/${q._id}`,
          lastModified: q.updatedAt ? new Date(q.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        }));
      }

      // Article pages
      if (data.posts?.length) {
        postRoutes = data.posts
          .filter((p) => p.slug)
          .map((p) => ({
            url: `${SITE_URL}/articles/${p.slug}`,
            lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
          }));
      }
    }
  } catch (err) {
    console.error('Sitemap: Failed to fetch dynamic URLs', err.message);
  }

  // Exam Resource pages (e.g., /resources/NIMCET)
  const examRoutes = Object.keys(dynamicResources).map((exam) => ({
    url: `${SITE_URL}/resources/${encodeURIComponent(exam)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Paper/exam/year pages (e.g., /paper/NIMCET/2024)
  const paperRoutes = [];
  Object.entries(dynamicResources).forEach(([exam, data]) => {
    if (data.yearwise?.length) {
      data.yearwise.forEach((paper) => {
        if (paper.year) {
          paperRoutes.push({
            url: `${SITE_URL}/paper/${encodeURIComponent(exam)}/${encodeURIComponent(paper.year)}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        }
      });
    }
  });

  return [...staticRoutes, ...postRoutes, ...questionRoutes, ...examRoutes, ...paperRoutes];
}
