import React, { useEffect } from 'react';
import { SITE_ORIGIN, robotsDirectiveFor } from '../../config/site';

export interface SEOProps {
  title: string;
  description: string;
  /**
   * @deprecated Ignored. The meta keywords tag is not used by search engines and
   * shipped the same 13-term list on every page; callers may still pass it so
   * no page has to change, but nothing is written (2026-10-23).
   */
  keywords?: string[];
  canonicalUrl?: string;
  /** Path-only canonical (e.g. '/blogs'); composed with the site origin. */
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  author?: string;
  publishedTime?: string;
  structuredData?: Record<string, any>;
  /**
   * Path used to decide the robots directive (D11). Defaults to the current
   * location, which already makes application and auth surfaces `noindex`.
   */
  routePath?: string;
  /** Explicit override, used by client-rendered "not found" states. */
  robots?: string;
  /**
   * Use `title` exactly as given instead of appending the site suffix.
   * Generated page families (docs, engines, blog) pass a pre-built title from
   * their own table so the hydrated title matches the prerendered one.
   */
  absoluteTitle?: boolean;
}

export const SEOHead: React.FC<SEOProps> = ({
  title,
  description,
  canonicalUrl,
  canonicalPath,
  ogType = 'website',
  ogImage = `${SITE_ORIGIN}/og-banner.png`,
  author = 'CatalystLab Telemetry Team',
  publishedTime,
  structuredData,
  routePath,
  robots,
  absoluteTitle = false
}) => {
  const fullTitle = absoluteTitle
    ? title
    : title.includes('CatalystLab')
      ? title
      : `${title} | CatalystLab Documentation & Developer Hub`;
  const pathForRobots =
    routePath || (typeof window !== 'undefined' ? window.location.pathname : '/');
  // D11: application, authentication and editor surfaces stay out of the index.
  const robotsDirective = robots ?? robotsDirectiveFor(pathForRobots);
  const currentUrl = canonicalUrl || (canonicalPath ? `${SITE_ORIGIN}${canonicalPath}` : typeof window !== 'undefined' ? window.location.href : SITE_ORIGIN);

  useEffect(() => {
    // Document title
    document.title = fullTitle;

    // Helper to update or create meta tags
    const setMetaTag = (nameAttr: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard SEO
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'author', author);
    setMetaTag('name', 'robots', robotsDirective);

    // Open Graph
    setMetaTag('property', 'og:site_name', 'CatalystLab Telemetry & Quality Engine');
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:locale', 'en_US');

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);
    setMetaTag('name', 'twitter:site', '@catalystlab');

    if (publishedTime && ogType === 'article') {
      setMetaTag('property', 'article:published_time', publishedTime);
      setMetaTag('property', 'article:author', author);
    }

    // Canonical link tag
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', currentUrl);

    // JSON-LD Structured Data
    const scriptId = 'catalystlab-json-ld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (structuredData) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(structuredData);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [fullTitle, description, currentUrl, ogType, ogImage, author, publishedTime, structuredData, robotsDirective]);

  return null;
};
