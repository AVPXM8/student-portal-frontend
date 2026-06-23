import ClientComp from "./ArticleListPage.jsx";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const SITE_URL = 'https://question.maarula.in';
const SITE_LOGO = "https://res.cloudinary.com/dwmj6up6j/image/upload/v1752687380/rqtljy0wi1uzq3itqxoe.png";
const POSTS_PER_PAGE = 13;

function stripHtml(s = '') {
  return s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
}

function excerpt(html = '', n = 180) {
  const t = stripHtml(html);
  return t.length > n ? `${t.slice(0, n).trim()}…` : t;
}

export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const title = `${page > 1 ? `Page ${page} | ` : ''}Articles & Exam News | Maarula Classes`;
  const description = "Latest exam updates, strategy guides, and insights for NIMCET, CUET-PG, and other MCA entrances from Maarula Classes.";
  const url = `${SITE_URL}/articles${page > 1 ? `?page=${page}` : ''}`;

  return {
    title,
    description,
    authors: [{ name: "Vivek Kumar", url: SITE_URL }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: "Latest Articles & Exam News for MCA Aspirants",
      description: "Stay updated with preparation strategies and insights from Maarula Classes.",
      url,
      type: "website",
      images: [{ url: SITE_LOGO }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Latest Articles & Exam News for MCA Aspirants",
      description: "Stay updated with preparation strategies and insights from Maarula Classes.",
      images: [SITE_LOGO],
    },
  };
}

export default async function Page({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);

  let posts = [];
  let totalPosts = 0;
  let totalPages = 1;

  try {
    const res = await fetch(`${API_BASE}/api/posts?page=${page}&limit=${POSTS_PER_PAGE}`, { next: { revalidate: 60 } });
    const data = await res.json();
    posts = Array.isArray(data.posts) ? data.posts : (Array.isArray(data) ? data : []);
    totalPosts = data.total || 0;
    totalPages = data.totalPages || 1;
  } catch (error) {
    console.error("Error fetching articles:", error);
  }

  // Server-side JSON-LD schemas — guaranteed in initial HTML
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Articles" },
    ],
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListOrder": "https://schema.org/ItemListUnordered",
    "numberOfItems": totalPosts,
    "itemListElement": posts.map((p, i) => ({
      "@type": "ListItem",
      "position": (page - 1) * POSTS_PER_PAGE + i + 1,
      "url": `${SITE_URL}/articles/${p.slug}`,
      "name": p.title,
    })),
  };

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Maarula Articles & Exam News",
    "url": `${SITE_URL}/articles`,
    "inLanguage": "en-IN",
    "blogPost": posts.slice(0, 13).map(p => ({
      "@type": "BlogPosting",
      "headline": p.title,
      "description": excerpt(p.content, 180),
      "url": `${SITE_URL}/articles/${p.slug}`,
      "image": p.featuredImage || SITE_LOGO,
      "datePublished": p.createdAt,
      "dateModified": p.updatedAt || p.createdAt,
      "author": { "@type": "Person", "name": "Vivek Kumar" },
      "publisher": {
        "@type": "Organization",
        "name": "Maarula Classes",
        "logo": { "@type": "ImageObject", "url": SITE_LOGO, "width": 512, "height": 512 },
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }} />
      <ClientComp 
        params={resolvedParams} 
        searchParams={resolvedSearchParams} 
        initialPosts={posts}
        initialTotalPosts={totalPosts}
        initialTotalPages={totalPages}
      />
    </>
  );
}
