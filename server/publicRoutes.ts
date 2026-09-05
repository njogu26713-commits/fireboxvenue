import type { Express, Request, Response } from "express";
import {
  getBlogPosts,
  getDirectoryItems,
  getFaqs,
  getProjects,
  getQuickHelp,
  getServices,
  getSupportCategories,
  getSupportChannels,
  getTeamMembers,
} from "./db";

const staticPages = [
  { path: "/", title: "Home", description: "Firebox Studios creative technology studio." },
  { path: "/solutions", title: "Solutions", description: "Firebox Studios products and projects." },
  { path: "/products", title: "Products", description: "Firebox Studios products and digital worlds." },
  { path: "/services", title: "Services", description: "Firebox Studios development and technology services." },
  { path: "/team", title: "Team", description: "Meet the Firebox Studios team." },
  { path: "/support", title: "Support", description: "Support channels, quick help, categories, and FAQs." },
  { path: "/ask-ai", title: "Ask AI", description: "Ask Firebox Studios about its public capabilities." },
  { path: "/blog", title: "Blog", description: "Firebox Studios articles, tutorials, and case studies." },
  { path: "/docs", title: "Documentation", description: "Firebox Studios product and developer documentation." },
];

function baseUrl(req: Request) {
  const forwardedProtocol = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol || (process.env.NODE_ENV === "production" ? "https" : req.protocol);
  return (process.env.PUBLIC_SITE_URL || `${protocol}://${req.get("host")}`).replace(/\/$/, "");
}

function xmlEscape(value: string) {
  return value.replace(/[<>&'\"]/g, character => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character] ?? character);
}

async function publicContent() {
  const [products, services, posts, faqs, resources, team, channels, quickHelp, categories] = await Promise.all([
    getServices(),
    getProjects(),
    getBlogPosts(),
    getFaqs(),
    getDirectoryItems(),
    getTeamMembers(),
    getSupportChannels(),
    getQuickHelp(),
    getSupportCategories(),
  ]);
  return {
    pages: staticPages,
    products: products.map(item => ({ title: item.title, description: item.description, imageUrl: item.imageUrl, liveUrl: item.liveUrl, githubUrl: item.githubUrl })),
    services: services.map(item => ({ title: item.title, client: item.client, description: item.description, imageUrl: item.imageUrl, liveUrl: item.liveUrl, githubUrl: item.githubUrl })),
    blog: posts.map(post => ({ title: post.title, slug: post.slug, excerpt: post.excerpt, category: post.category, content: post.content, author: post.author, publishedAt: post.publishedAt })),
    faqs: faqs.map(faq => ({ question: faq.question, answer: faq.answer })),
    resources: resources.filter(item => item.section !== "developers").map(item => ({ section: item.section, title: item.title, description: item.description, content: item.content, href: item.href })),
    team: team.map(member => ({ name: member.name, role: member.role, bio: member.bio, linkedinUrl: member.linkedinUrl })),
    support: {
      channels: channels.filter(channel => channel.value).map(channel => ({ platform: channel.platform, label: channel.label, value: channel.value })),
      quickHelp: quickHelp.map(item => ({ title: item.title, description: item.description, href: item.href })),
      categories: categories.map(item => ({ title: item.title, description: item.description })),
    },
  };
}

export function registerPublicRoutes(app: Express) {
  app.get("/api/public/pages", async (_req, res) => {
    res.json({ pages: staticPages });
  });

  app.get("/api/public/content", async (_req, res, next) => {
    try {
      res.json({ generatedAt: new Date().toISOString(), ...(await publicContent()) });
    } catch (error) {
      next(error);
    }
  });

  app.get("/robots.txt", (req, res) => {
    const origin = baseUrl(req);
    res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\nAI content: ${origin}/llms.txt\n`);
  });

  app.get("/sitemap.xml", (req, res) => {
    const origin = baseUrl(req);
    const urls = staticPages.map(page => `${origin}${page.path}`);
    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${xmlEscape(url)}</loc></url>`).join("")}</urlset>`);
  });

  app.get("/llms.txt", async (req, res, next) => {
    try {
      const content = await publicContent();
      const origin = baseUrl(req);
      const lines = [
        "# Firebox Studios",
        "",
        "> Firebox Studios builds digital products, services, and interactive experiences.",
        "",
        "## Public pages",
        ...content.pages.map(page => `- [${page.title}](${origin}${page.path}): ${page.description}`),
        "",
        "## Machine-readable content",
        `- [Public content JSON](${origin}/api/public/content)`,
        `- [Public page index](${origin}/api/public/pages)`,
        "",
        "## Published knowledge",
        ...content.faqs.map(faq => `- FAQ: ${faq.question} — ${faq.answer}`),
        ...content.blog.map(post => `- ${post.category}: ${post.title} — ${post.excerpt} (${origin}/blog/${post.slug})`),
        ...content.support.categories.map(category => `- Support category: ${category.title} — ${category.description}`),
        ...content.support.quickHelp.map(item => `- Quick help: ${item.title} — ${item.description}`),
        "",
        "For the complete current public dataset, use the JSON endpoint above.",
      ];
      res.type("text/plain").send(lines.join("\n"));
    } catch (error) {
      next(error);
    }
  });
}

export { publicContent };
