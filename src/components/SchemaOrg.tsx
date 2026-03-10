import { useEffect } from "react";

interface SchemaOrgProps {
  schema: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Injecte un script JSON-LD Schema.org dans le <head>.
 * Accepte un objet ou un tableau d'objets schema.
 */
const SchemaOrg = ({ schema }: SchemaOrgProps) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    script.setAttribute("data-schema-org", "true");
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [schema]);

  return null;
};

export default SchemaOrg;

// --- Schemas pre-configures pour SIVFlow ---

export const sivflowOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SIVFlow",
  legalName: "SIVFlow SAS",
  url: "https://sivflow.fr",
  logo: "https://sivflow.fr/logo.png",
  description:
    "Service habilite par le Ministere de l'Interieur et l'ANTS pour les demarches de carte grise et immatriculation en ligne.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "contact@sivflow.fr",
    availableLanguage: "French",
  },
  sameAs: [],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    bestRating: "5",
    ratingCount: "4839",
  },
};

export const sivflowWebSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SIVFlow",
  url: "https://sivflow.fr",
  description:
    "Carte grise, declaration d'achat, cession... Simplifiez toutes vos demarches SIV en ligne. Agree par le Ministere de l'Interieur.",
  publisher: {
    "@type": "Organization",
    name: "SIVFlow",
    url: "https://sivflow.fr",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://sivflow.fr/simulateur?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export const sivflowServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Carte grise en ligne",
  description:
    "Service de carte grise et demarches d'immatriculation en ligne. Habilite par le Ministere de l'Interieur et agree ANTS.",
  provider: {
    "@type": "Organization",
    name: "SIVFlow",
    url: "https://sivflow.fr",
  },
  serviceType: "Demarches d'immatriculation de vehicules",
  areaServed: {
    "@type": "Country",
    name: "France",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Demarches carte grise",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Carte grise - Changement de titulaire",
        },
        price: "29.90",
        priceCurrency: "EUR",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Declaration de cession",
        },
        price: "29.90",
        priceCurrency: "EUR",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Changement d'adresse carte grise",
        },
        price: "29.90",
        priceCurrency: "EUR",
      },
    ],
  },
};

export const sivflowBreadcrumbSchema = (
  items: { name: string; url: string }[]
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

/**
 * Genere un schema Service pour une demarche specifique.
 */
export const sivflowDemarcheServiceSchema = (demarche: {
  titre: string;
  description: string;
  prix_base: number;
  slug: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: demarche.titre,
  description: demarche.description,
  provider: {
    "@type": "Organization",
    name: "SIVFlow",
    url: "https://sivflow.fr",
  },
  areaServed: {
    "@type": "Country",
    name: "France",
  },
  url: `https://sivflow.fr/demarches/${demarche.slug}`,
  offers: {
    "@type": "Offer",
    price: String(demarche.prix_base),
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
  },
});
