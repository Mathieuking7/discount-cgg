/**
 * Utilitaire centralisé pour le calcul des montants de paiement
 * 
 * Règles TVA :
 * - Carte grise (taxe régionale) = exonérée de TVA (HT = TTC)
 * - Tous les services (frais de dossier, options) = TVA 20%
 */

export interface TrackingService {
  id: string;
  service_type: string;
  price: number; // Prix HT
}

export interface PaymentCalculationInput {
  prixCarteGrise: number;      // Taxe régionale (exonérée TVA)
  fraisDossier: number;        // Frais de dossier HT
  trackingServices: TrackingService[];  // Options HT
}

export interface PaymentCalculationResult {
  // Détail des lignes
  prixCarteGrise: number;      // Exonéré TVA
  fraisDossier: number;        // HT
  optionsHT: number;           // Somme des options HT
  
  // Totaux
  totalServicesHT: number;     // fraisDossier + optionsHT
  tva: number;                 // TVA 20% sur services
  totalTTC: number;            // prixCarteGrise + totalServicesHT + tva
}

export const SERVICE_LABELS: Record<string, string> = {
  dossier_prioritaire: "Dossier prioritaire",
  certificat_non_gage: "Certificat de non-gage",
  suivi_email: "Suivi par email",
  suivi_sms: "Suivi par SMS",
  suivi_complet: "Suivi complet",
};

/**
 * Calcule tous les montants pour une démarche Carte Grise
 */
export function calculatePaymentDetails(input: PaymentCalculationInput): PaymentCalculationResult {
  const { prixCarteGrise, fraisDossier, trackingServices } = input;
  
  // Somme des options HT
  const optionsHT = trackingServices.reduce((sum, s) => sum + (s.price || 0), 0);
  
  // Total des services soumis à TVA
  const totalServicesHT = fraisDossier + optionsHT;
  
  // TVA 20% sur les services uniquement
  const tva = totalServicesHT * 0.20;
  
  // Total TTC = carte grise (exonérée) + services HT + TVA
  const totalTTC = prixCarteGrise + totalServicesHT + tva;
  
  return {
    prixCarteGrise,
    fraisDossier,
    optionsHT,
    totalServicesHT,
    tva,
    totalTTC,
  };
}

/**
 * Calcule les montants pour une démarche NON Carte Grise (DA, DC, etc.)
 * Tout est soumis à TVA 20%
 */
export function calculateNonCGPaymentDetails(input: Omit<PaymentCalculationInput, 'prixCarteGrise'>): PaymentCalculationResult {
  const { fraisDossier, trackingServices } = input;
  
  // Somme des options HT
  const optionsHT = trackingServices.reduce((sum, s) => sum + (s.price || 0), 0);
  
  // Total HT
  const totalServicesHT = fraisDossier + optionsHT;
  
  // TVA 20%
  const tva = totalServicesHT * 0.20;
  
  // Total TTC
  const totalTTC = totalServicesHT + tva;
  
  return {
    prixCarteGrise: 0,
    fraisDossier,
    optionsHT,
    totalServicesHT,
    tva,
    totalTTC,
  };
}

/**
 * Extrait le prix de la carte grise à partir du montant TTC stocké
 * Utilisé quand on n'a pas le prix carte grise séparément
 * 
 * Formule inverse :
 * totalTTC = prixCarteGrise + totalServicesHT + (totalServicesHT * 0.20)
 * totalTTC = prixCarteGrise + totalServicesHT * 1.20
 * prixCarteGrise = totalTTC - (totalServicesHT * 1.20)
 */
export function extractPrixCarteGriseFromTTC(
  montantTtc: number,
  fraisDossier: number,
  trackingServices: TrackingService[]
): number {
  const optionsHT = trackingServices.reduce((sum, s) => sum + (s.price || 0), 0);
  const totalServicesHT = fraisDossier + optionsHT;
  const servicesTTC = totalServicesHT * 1.20;
  
  // Le prix carte grise ne peut pas être négatif
  return Math.max(0, montantTtc - servicesTTC);
}
