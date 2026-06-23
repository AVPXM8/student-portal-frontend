import ClientComp from "./SinglePostPage.jsx";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const SITE_URL = 'https://question.maarula.in';
const SITE_LOGO = "https://res.cloudinary.com/dwmj6up6j/image/upload/v1752687380/rqtljy0wi1uzq3itqxoe.png";

function stripHtml(s = '') {
  return s
    .replace(/<\/(td|th|tr|p|div|h[1-6]|li)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_BASE}/api/posts/${slug}`, { next: { revalidate: 60 } });
    const post = await res.json();

    if (!post || !post.title) return { title: "Article Not Found" };

    const description = post.metaDescription || stripHtml(post.content || '').slice(0, 160);
    const image = post.featuredImage || SITE_LOGO;
    const url = `${SITE_URL}/articles/${slug}`;

    return {
      title: `${post.title} | Maarula Classes`,
      description,
      authors: [{ name: "Vivek Kumar", url: SITE_URL }],
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: post.title,
        description,
        url,
        images: [{ url: image, width: 1200, height: 630 }],
        type: 'article',
        publishedTime: post.createdAt,
        modifiedTime: post.updatedAt,
        siteName: 'Mathem Solvex by Maarula Classes',
        section: post.category || 'Education',
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
        images: [image],
      },
    };
  } catch (error) {
    return { title: "Maarula Classes | Latest Updates" };
  }
}

export default async function Page({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  let post = null;
  let recentPosts = [];
  let relatedPosts = [];
  let jsonLd = null;
  let breadcrumbLd = null;

  try {
    const postRes = await fetch(`${API_BASE}/api/posts/${resolvedParams.slug}`, { next: { revalidate: 60 } });
    post = await postRes.json();

    if (post && post.title) {
      const [recentRes, relatedRes] = await Promise.all([
        fetch(`${API_BASE}/api/posts?limit=6`, { next: { revalidate: 60 } }),
        post.category ? fetch(`${API_BASE}/api/posts?category=${encodeURIComponent(post.category)}&limit=6`, { next: { revalidate: 60 } }) : Promise.resolve({ json: () => ({ posts: [] }) })
      ]);

      const recentData = await recentRes.json();
      const recentArr = Array.isArray(recentData) ? recentData : (recentData?.posts || []);
      recentPosts = recentArr.filter((p) => p.slug !== resolvedParams.slug).slice(0, 5);

      const relatedData = await relatedRes.json();
      const relatedArr = Array.isArray(relatedData) ? (Array.isArray(relatedData.posts) ? relatedData.posts : relatedData) : (relatedData?.posts || []);
      relatedPosts = relatedArr.filter((p) => p.slug !== resolvedParams.slug).slice(0, 4);

      const description = post.metaDescription || stripHtml(post.content || "").slice(0, 300);
      const image = post.featuredImage || SITE_LOGO;
      const url = `${SITE_URL}/articles/${resolvedParams.slug}`;
      const wordCount = stripHtml(post.content || "").split(/\s+/).filter(Boolean).length;

      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": description,
        "image": [image],
        "datePublished": post.createdAt,
        "dateModified": post.updatedAt || post.createdAt,
        "wordCount": wordCount,
        "author": {
          "@type": "Person",
          "name": "Vivek Kumar",
          "url": SITE_URL,
        },
        "publisher": {
          "@type": "Organization",
          "name": "Maarula Classes",
          "url": "https://maarula.in",
          "logo": {
            "@type": "ImageObject",
            "url": SITE_LOGO,
            "width": 512,
            "height": 512,
          },
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": url,
        },
        "articleSection": post.category || "Education",
        "inLanguage": "en-IN",
      };

      // Single authoritative BreadcrumbList — rendered server-side only here
      breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
          { "@type": "ListItem", "position": 2, "name": "Articles", "item": `${SITE_URL}/articles` },
          { "@type": "ListItem", "position": 3, "name": post.title },
        ],
      };
    }
  } catch (error) {
    console.error("Error fetching article data:", error);
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}
      <ClientComp
        params={resolvedParams}
        searchParams={resolvedSearchParams}
        initialPost={post}
        initialRecentPosts={recentPosts}
        initialRelatedPosts={relatedPosts}
      />
    </>
  );
}
