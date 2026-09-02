import React, { useEffect } from 'react';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  /** Path-only canonical (e.g. '/blogs'); composed with the site origin. */
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  author?: string;
  publishedTime?: string;
  structuredData?: Record<string, any>;
}

export const SEOHead: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  canonicalUrl,
  canonicalPath,
  ogType = 'website',
  ogImage = 'https://www.catalystlab.tech/og-banner.png',
  author = 'CatalystLab Telemetry Team',
  publishedTime,
  structuredData
}) => {
  const fullTitle = title.includes('CatalystLab') ? title : `${title} | CatalystLab Documentation & Developer Hub`;
  const SITE_ORIGIN = 'https://www.catalystlab.tech';
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
    if (keywords.length > 0) {
      setMetaTag('name', 'keywords', keywords.join(', '));
    }
    setMetaTag('name', 'author', author);
    setMetaTag('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

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
  }, [fullTitle, description, keywords, currentUrl, ogType, ogImage, author, publishedTime, structuredData]);

  return null;
};
