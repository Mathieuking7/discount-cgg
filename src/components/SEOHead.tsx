import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

/**
 * Composant SEO qui met a jour dynamiquement les meta tags du <head>.
 * Alternative a react-helmet pour les SPA React sans SSR.
 */
const SEOHead = ({
  title,
  description,
  canonicalUrl,
  ogImage = "https://kingcartegrise.sivflow.fr/og-image.png",
  ogType = "website",
  noindex = false,
}: SEOHeadProps) => {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta description
    updateMeta("description", description);

    // Robots
    if (noindex) {
      updateMeta("robots", "noindex, nofollow");
    } else {
      removeMeta("robots");
    }

    // Open Graph
    updateMetaProperty("og:title", title);
    updateMetaProperty("og:description", description);
    updateMetaProperty("og:type", ogType);
    updateMetaProperty("og:image", ogImage);
    if (canonicalUrl) {
      updateMetaProperty("og:url", canonicalUrl);
    }

    // Twitter Card
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", title);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", ogImage);

    // Canonical
    if (canonicalUrl) {
      let link = document.querySelector(
        'link[rel="canonical"]'
      ) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonicalUrl);
    }

    return () => {
      // Cleanup canonical on unmount
      const link = document.querySelector('link[rel="canonical"]');
      if (link) link.remove();
    };
  }, [title, description, canonicalUrl, ogImage, ogType, noindex]);

  return null;
};

function updateMeta(name: string, content: string) {
  let el = document.querySelector(
    `meta[name="${name}"]`
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function updateMetaProperty(property: string, content: string) {
  let el = document.querySelector(
    `meta[property="${property}"]`
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(name: string) {
  const el = document.querySelector(`meta[name="${name}"]`);
  if (el) el.remove();
}

export default SEOHead;
