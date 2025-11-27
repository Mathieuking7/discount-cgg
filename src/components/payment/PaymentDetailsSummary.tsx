import { Separator } from "@/components/ui/separator";

// Types pour les services de suivi
export interface TrackingService {
  id: string;
  service_type: string;
  price: number;
}

// Labels pour les types de services
export const SERVICE_LABELS: Record<string, string> = {
  priority: "Dossier prioritaire",
  non_gage: "Certificat de non-gage",
  email: "Suivi email",
  sms: "Suivi SMS",
  complete: "Suivi complet",
};

interface PaymentDetailsSummaryProps {
  demarcheType: string;
  fraisDossier: number;           // Prix HT des frais de dossier (prix de l'action)
  montantTtc: number;             // Montant total stocké en BD (fallback)
  trackingServices: TrackingService[];
  actionRapideTitre?: string;
  prixCarteGrise?: number;        // Prix carte grise (taxe régionale, exonérée TVA)
  onCalculated?: (result: PaymentCalculationResult) => void;
}

export interface PaymentCalculationResult {
  prixCarteGrise: number;
  fraisDossier: number;
  optionsTotal: number;
  totalServicesHT: number;
  tva: number;
  totalTTC: number;
}

/**
 * Composant d'affichage du récapitulatif de paiement
 * 
 * RÈGLES D'AFFICHAGE :
 * 1. Chaque ligne est affichée séparément (pas d'addition dans cette zone)
 * 2. Carte grise = exonérée TVA
 * 3. Services = prix HT uniquement (TVA calculée à la fin)
 * 4. Totaux en bas : Total HT, TVA 20%, Total TTC
 */
export const PaymentDetailsSummary = ({
  demarcheType,
  fraisDossier,
  montantTtc,
  trackingServices,
  actionRapideTitre,
  prixCarteGrise: prixCarteGriseProp,
  onCalculated,
}: PaymentDetailsSummaryProps) => {
  // Détermine si c'est une démarche Carte Grise
  const isCG = demarcheType === "CG" || demarcheType === "CG_DA" || demarcheType === "CG_IMPORT";

  // Prix carte grise (taxe régionale) - passé en prop ou 0 pour non-CG
  const prixCarteGrise = isCG ? (prixCarteGriseProp || 0) : 0;
  
  // Frais de dossier HT (prix de l'action)
  const fraisDossierHT = fraisDossier || 0;
  
  // Options HT
  const optionsTotal = trackingServices.reduce((sum, s) => sum + s.price, 0);
  
  // Total services HT (soumis à TVA)
  const totalServicesHT = fraisDossierHT + optionsTotal;
  
  // TVA 20% sur les services uniquement
  const tva = totalServicesHT * 0.20;
  
  // Total TTC = carte grise (exonérée) + services HT + TVA
  const totalTTC = prixCarteGrise + totalServicesHT + tva;

  // Créer le résultat du calcul
  const result: PaymentCalculationResult = {
    prixCarteGrise,
    fraisDossier: fraisDossierHT,
    optionsTotal,
    totalServicesHT,
    tva,
    totalTTC,
  };

  // Notifier le parent du calcul si callback fourni
  if (onCalculated) {
    onCalculated(result);
  }

  // ==============================
  // AFFICHAGE POUR CARTE GRISE
  // ==============================
  if (isCG) {
    return (
      <div className="space-y-4">
        {/* BLOC 1 : Carte grise (exonérée TVA) */}
        {prixCarteGrise > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Carte grise
            </p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Taxe régionale</span>
              <div className="text-right">
                <span className="font-medium">{prixCarteGrise.toFixed(2)} €</span>
                <span className="text-xs text-muted-foreground ml-1">(exonéré TVA)</span>
              </div>
            </div>
          </div>
        )}

        {(prixCarteGrise > 0 && totalServicesHT > 0) && <Separator />}

        {/* BLOC 2 : Services (HT) - chaque ligne séparément */}
        {totalServicesHT > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Services (HT)
            </p>

            {/* Frais de dossier */}
            {fraisDossierHT > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Frais de dossier</span>
                <span>{fraisDossierHT.toFixed(2)} €</span>
              </div>
            )}

            {/* Options - chacune sur sa propre ligne */}
            {trackingServices.map((service) => (
              <div key={service.id} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {SERVICE_LABELS[service.service_type] || service.service_type}
                </span>
                <span>{service.price.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* BLOC 3 : Totaux */}
        <div className="space-y-2">
          {totalServicesHT > 0 && (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total HT (services)</span>
                <span>{totalServicesHT.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">TVA (20%)</span>
                <span>{tva.toFixed(2)} €</span>
              </div>
              <Separator className="my-2" />
            </>
          )}
          <div className="flex justify-between items-center font-semibold">
            <span>Total TTC</span>
            <span className="text-lg text-primary">{totalTTC.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // AFFICHAGE POUR NON CARTE GRISE (DA, DC, etc.)
  // ==============================
  return (
    <div className="space-y-4">
      {/* Services (HT) - chaque ligne séparément */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Services (HT)
        </p>

        {/* Frais de dossier / Action rapide */}
        {fraisDossierHT > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {actionRapideTitre || "Frais de dossier"}
            </span>
            <span>{fraisDossierHT.toFixed(2)} €</span>
          </div>
        )}

        {/* Options - chacune sur sa propre ligne */}
        {trackingServices.map((service) => (
          <div key={service.id} className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {SERVICE_LABELS[service.service_type] || service.service_type}
            </span>
            <span>{service.price.toFixed(2)} €</span>
          </div>
        ))}
      </div>

      <Separator />

      {/* Totaux */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Total HT</span>
          <span>{totalServicesHT.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">TVA (20%)</span>
          <span>{tva.toFixed(2)} €</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between items-center font-semibold">
          <span>Total TTC</span>
          <span className="text-lg text-primary">{totalTTC.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
};
