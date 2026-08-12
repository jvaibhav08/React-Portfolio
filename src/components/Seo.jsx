import { useEffect } from "react";
import defaultSocialImage from "../assets/vishwas-portfolio-hero-1.jpg";

const SITE_URL = "https://vishwasjha.com";
const DEFAULT_IMAGE = defaultSocialImage;

const upsertMeta = (attribute, key, content) => {
  if (!content) return;
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

const removeMeta = (attribute, key) => document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove();
const absoluteUrl = (value) => new URL(value || DEFAULT_IMAGE, SITE_URL).toString();

export const siteUrlFor = (path = "/") => new URL(path, SITE_URL).toString();

export default function Seo({ title, description, path, image, type = "website", publishedTime, modifiedTime, author, structuredData, robots }) {
  const structuredDataJson = structuredData ? JSON.stringify(structuredData).replace(/</g, "\\u003c") : null;

  useEffect(() => {
    const canonicalUrl = siteUrlFor(path);
    document.title = title;

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:site_name", "Vishwas Jha");
    upsertMeta("property", "og:image", absoluteUrl(image));
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", absoluteUrl(image));

    if (robots) upsertMeta("name", "robots", robots);
    else removeMeta("name", "robots");

    [["article:published_time", publishedTime], ["article:modified_time", modifiedTime], ["article:author", author]].forEach(([key, value]) => {
      if (type === "article" && value) upsertMeta("property", key, value);
      else removeMeta("property", key);
    });
  }, [author, description, image, modifiedTime, path, publishedTime, robots, title, type]);

  useEffect(() => {
    const scriptId = "seo-structured-data";
    let script = document.head.querySelector(`#${scriptId}`);
    if (!structuredDataJson) {
      script?.remove();
      return;
    }
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = structuredDataJson;
  }, [structuredDataJson]);

  return null;
}
