import type { Express, Request, Response } from "express";
import {
  getBlogPosts,
  getBlogPostBySlug,
  getDirectoryItems,
  getDirectoryItem,
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

function htmlEscape(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function markdownToHtml(markdown: string) {
  return markdown
    .split(/\n\s*\n/)
    .map(block => {
      const text = htmlEscape(block.trim())
        .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
        .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
        .replace(/^#\s+(.+)$/gm, "<h1>$1</h1>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br />");
      return /^<h[1-3]>/.test(text) ? text : `<p>${text}</p>`;
    })
    .join("\n");
}

function renderPublicHtml(
  req: Request,
  title: string,
  description: string,
  content: string,
  canonicalPath: string
) {
  const origin = baseUrl(req);
  const canonical = `${origin}${canonicalPath}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${htmlEscape(title)} — Firebox Studios</title><meta name="description" content="${htmlEscape(description)}" /><link rel="canonical" href="${htmlEscape(canonical)}" /></head><body><header><a href="${origin}/">Firebox Studios</a></header><main><h1>${htmlEscape(title)}</h1><p>${htmlEscape(description)}</p>${content}</main><footer><a href="${origin}/support">Support</a> · <a href="${origin}/api/public/content">Machine-readable public content</a></footer></body></html>`;
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
  app.get("/docs", async (req, res, next) => {
    try {
      const docs = await getDirectoryItems("docs");
      const content = docs
        .map(
          item =>
            `<article><h2><a href="/docs/${item.id}">${htmlEscape(item.title)}</a></h2><p>${htmlEscape(item.description)}</p></article>`
        )
        .join("\n");
      res.type("html").send(
        renderPublicHtml(
          req,
          "Documentation",
          "Internal guides, setup notes, and practical documentation written and published directly by Firebox.",
          content || "<p>No published documentation is available yet.</p>",
          "/docs"
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/docs/:id", async (req, res, next) => {
    try {
      const item = await getDirectoryItem(Number(req.params.id));
      if (!item || item.section !== "docs") {
        res.status(404).type("html").send(renderPublicHtml(req, "Documentation not found", "The requested documentation page could not be found.", "<p>Return to <a href=\"/docs\">Documentation</a>.</p>", "/docs"));
        return;
      }
      res.type("html").send(renderPublicHtml(req, item.title, item.description, markdownToHtml(item.content || item.description), `/docs/${item.id}`));
    } catch (error) {
      next(error);
    }
  });

  app.get("/blog", async (req, res, next) => {
    try {
      const posts = await getBlogPosts();
      const content = posts
        .map(
          post =>
            `<article><h2><a href="/blog/${post.slug}">${htmlEscape(post.title)}</a></h2><p>${htmlEscape(post.excerpt)}</p><p>Category: ${htmlEscape(post.category)} · Author: ${htmlEscape(post.author)}</p></article>`
        )
        .join("\n");
      res.type("html").send(renderPublicHtml(req, "Blog", "Ideas, field notes, and build logs from Firebox Studios.", content || "<p>No published blog posts are available yet.</p>", "/blog"));
    } catch (error) {
      next(error);
    }
  });

  app.get("/blog/:slug", async (req, res, next) => {
    try {
      const post = await getBlogPostBySlug(req.params.slug);
      if (!post) {
        res.status(404).type("html").send(renderPublicHtml(req, "Article not found", "The requested blog article could not be found.", "<p>Return to <a href=\"/blog\">Blog</a>.</p>", "/blog"));
        return;
      }
      const content = `${post.imageUrl ? `<img src="${htmlEscape(post.imageUrl)}" alt="" />` : ""}${post.videoUrl ? `<p>Video tutorial available: ${htmlEscape(post.videoUrl)}</p>` : ""}${markdownToHtml(post.content)}`;
      res.type("html").send(renderPublicHtml(req, post.title, post.excerpt, content, `/blog/${post.slug}`));
    } catch (error) {
      next(error);
    }
  });

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
