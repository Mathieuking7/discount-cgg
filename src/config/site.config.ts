// ==========================================================
// CONFIGURATION UNIQUE DE L'INSTANCE
// Modifier UNIQUEMENT ce fichier pour rebrander une instance.
// ==========================================================

export const siteConfig = {
  // -- Identite
  siteName: "SIVFlow",
  tagline: "Gerez vos demarches auto en quelques clics",
  legalName: "SIVFlow SAS",

  // -- Visuels
  logo: "/logo.png",
  logoAlt: "SIVFlow",
  favicon: "/favicon.ico",

  // -- Domaine & URLs
  domain: "sivflow.fr",
  baseUrl: "https://sivflow.fr",

  // -- Emails
  emails: {
    contact: "contact@sivflow.fr",
    noreply: "noreply@sivflow.fr",
    support: "support@sivflow.fr",
  },

  // -- Reseaux sociaux
  social: {
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
  },

  // -- Feature flags
  features: {
    guestOrders: true,
    smsNotifications: true,
    tokenSystem: true,
    proVerification: true,
    simulateur: true,
  },

  // -- SEO
  seo: {
    defaultTitle: "SIVFlow - Gerez vos demarches auto en quelques clics",
    defaultDescription:
      "Carte grise, declaration d'achat, cession... Simplifiez toutes vos demarches SIV en ligne. Agree par le Ministere de l'Interieur.",
  },

  // -- Pricing (affichage landing page)
  pricing: {
    starter: {
      name: "Essentiel",
      price: "29,90",
      unit: "/ demarche",
    },
    pro: {
      name: "Express",
      price: "49,90",
      unit: "/ demarche",
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
