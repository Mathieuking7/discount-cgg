import { Separator } from "@/components/ui/separator";
import {
  calculatePaymentDetails,
  calculateNonCGPaymentDetails,
  extractPrixCarteGriseFromTTC,
  SERVICE_LABELS,
  type TrackingService,
  type PaymentCalculationResult,
} from "@/utils/calculatePaymentDetails";

interface PaymentDetailsSummaryProps {
  demarcheType: string;
  fraisDossier: number;         // Prix HT
  montantTtc: number;           // Montant total stocké en BD
  trackingServices: TrackingService[];
  actionRapideTitre?: string;
  prixCarteGrise?: number;      // Prix carte grise si connu
  onCalculated?: (result: PaymentCalculationResult) => void;
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

  // Calcul des montants
  let result: PaymentCalculationResult;

  if (isCG) {
    // Pour les démarches CG : extraire le prix carte grise si non fourni
    const prixCarteGrise = prixCarteGriseProp ?? extractPrixCarteGriseFromTTC(
      montantTtc,
      fraisDossier,
      trackingServices
    );

    result = calculatePaymentDetails({
      prixCarteGrise,
      fraisDossier,
      trackingServices,
    });
  } else {
    // Pour les autres démarches : pas de carte grise
    result = calculateNonCGPaymentDetails({
      fraisDossier,
      trackingServices,
    });
  }

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
        {result.prixCarteGrise > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Carte grise
            </p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Taxe régionale</span>
              <div className="text-right">
                <span className="font-medium">{result.prixCarteGrise.toFixed(2)} €</span>
                <span className="text-xs text-muted-foreground ml-1">(exonéré TVA)</span>
              </div>
            </div>
          </div>
        )}

        {(result.prixCarteGrise > 0 && result.totalServicesHT > 0) && <Separator />}

        {/* BLOC 2 : Services (HT) - chaque ligne séparément */}
        {result.totalServicesHT > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Services (HT)
            </p>

            {/* Frais de dossier */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Frais de dossier</span>
              <span>{result.fraisDossier.toFixed(2)} €</span>
            </div>

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
          {result.totalServicesHT > 0 && (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total HT (services)</span>
                <span>{result.totalServicesHT.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">TVA (20%)</span>
                <span>{result.tva.toFixed(2)} €</span>
              </div>
              <Separator className="my-2" />
            </>
          )}
          <div className="flex justify-between items-center font-semibold">
            <span>Total TTC</span>
            <span className="text-lg text-primary">{result.totalTTC.toFixed(2)} €</span>
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

        {/* Action rapide / Frais de dossier */}
        {actionRapideTitre && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{actionRapideTitre}</span>
            <span>{result.fraisDossier.toFixed(2)} €</span>
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
          <span>{result.totalServicesHT.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">TVA (20%)</span>
          <span>{result.tva.toFixed(2)} €</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between items-center font-semibold">
          <span>Total TTC</span>
          <span className="text-lg text-primary">{result.totalTTC.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
};
