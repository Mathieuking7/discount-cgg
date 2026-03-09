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

export const sivflowSoftwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SIVFlow",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Plateforme SIV pour professionnels automobile. Carte grise, declaration d'achat et de cession en ligne.",
  url: "https://sivflow.fr",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: "10",
    highPrice: "30",
    offerCount: "3",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "150",
  },
  featureList: [
    "Carte grise en ligne",
    "Declaration d'achat (DA)",
    "Declaration de cession (DC)",
    "Simulateur de prix carte grise",
    "Suivi de dossier en temps reel",
  ],
};

export const sivflowOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SIVFlow",
  url: "https://sivflow.fr",
  logo: "https://sivflow.fr/logo.png",
  description:
    "Service professionnel de carte grise et demarches SIV en ligne pour garages, negociants VO et experts automobile.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "French",
  },
  sameAs: [],
};

export const sivflowFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Combien coute une carte grise pour un professionnel automobile ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Avec SIVFlow, le service de carte grise professionnel est a 30EUR. Les declarations d'achat et de cession sont a 10EUR chacune. Les taxes departementales s'ajoutent selon le departement et la puissance fiscale du vehicule.",
      },
    },
    {
      "@type": "Question",
      name: "Comment faire une declaration d'achat en ligne en tant que garage ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sur SIVFlow, selectionnez 'Declaration d'achat', entrez l'immatriculation du vehicule, telechargez les documents requis et validez. Le traitement est effectue sous 24h ouvrees.",
      },
    },
    {
      "@type": "Question",
      name: "Quels documents fournir pour une carte grise professionnelle ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vous devez fournir : un Kbis de moins de 3 mois, une piece d'identite du gerant, le certificat de cession du vehicule, le controle technique valide et un mandat de representation.",
      },
    },
    {
      "@type": "Question",
      name: "Quel est le delai pour recevoir une carte grise en ligne ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les dossiers sont traites en moins de 24 heures ouvrees des reception de l'ensemble des pieces justificatives. Vous recevez des notifications a chaque etape.",
      },
    },
    {
      "@type": "Question",
      name: "Comment obtenir l'habilitation SIV pour mon garage ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "L'habilitation SIV s'obtient aupres de la prefecture. Avec SIVFlow, meme sans habilitation, vous pouvez realiser vos demarches carte grise via notre plateforme agreee.",
      },
    },
    {
      "@type": "Question",
      name: "Peut-on faire une carte grise sans se deplacer en prefecture ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, depuis la mise en place du SIV, toutes les demarches de carte grise se font en ligne. SIVFlow vous permet de realiser 100% des demarches sans deplacement.",
      },
    },
    {
      "@type": "Question",
      name: "La declaration de cession est-elle obligatoire pour les professionnels ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, la declaration de cession est obligatoire lors de la vente d'un vehicule. Elle doit etre realisee dans les 15 jours suivant la cession sous peine d'amende.",
      },
    },
    {
      "@type": "Question",
      name: "Comment calculer le prix d'une carte grise par departement ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le prix depend de la puissance fiscale du vehicule et du tarif du cheval fiscal de votre departement. Utilisez notre simulateur gratuit pour obtenir un calcul precis et instantane.",
      },
    },
  ],
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
