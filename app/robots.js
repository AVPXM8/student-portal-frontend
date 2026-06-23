export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/test/", "/report-issue/"],
      },
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "Claude-Web",
          "Google-Extended",
          "PerplexityBot",
          "cohere-ai",
          "facebookexternalhit"
        ],
        allow: ["/", "/llms.txt", "/llms-full.txt", "/.well-known/ai-plugin.json", "/openapi.json"],
        disallow: ["/api/", "/admin/", "/test/", "/report-issue/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/admin/", "/test/"],
      },
    ],
    sitemap: "https://question.maarula.in/sitemap.xml",
  };
}

