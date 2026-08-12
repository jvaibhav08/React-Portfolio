import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const SITE_URL = "https://vishwasjha.com";
const projectId = process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || "6osvtvxy";
const dataset = process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || "production";
const query = `*[_type == "post" && defined(slug.current) && defined(publishedAt) && !(_id in path("drafts.**"))] | order(publishedAt desc){"slug": slug.current, _updatedAt}`;

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toLastMod = (date) => (date ? new Date(date).toISOString().slice(0, 10) : null);

async function getPublishedPosts() {
  const endpoint = new URL(`https://${projectId}.api.sanity.io/v2023-07-01/data/query/${dataset}`);
  endpoint.searchParams.set("query", query);

  const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Sanity sitemap query failed: ${response.status} ${response.statusText}`);
  }

  const { result } = await response.json();
  return Array.isArray(result) ? result : [];
}

function sitemapEntry(path, lastmod) {
  const url = new URL(path, SITE_URL).toString();
  return [
    "  <url>",
    `    <loc>${escapeXml(url)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function main() {
  const posts = await getPublishedPosts();
  const entries = [sitemapEntry("/"), sitemapEntry("/blog")];

  for (const post of posts) {
    entries.push(sitemapEntry(`/blog/${encodeURIComponent(post.slug)}`, toLastMod(post._updatedAt)));
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries.join("\n"),
    "</urlset>",
    "",
  ].join("\n");

  const outputPath = resolve("public", "sitemap.xml");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, sitemap, "utf8");
  console.log(`Generated sitemap.xml with ${entries.length} URLs.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
