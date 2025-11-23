import { Card, CardContent } from "@/components/ui/card";
import { PriceCalculation } from "@/utils/calculatePrice";
import { Badge } from "@/components/ui/badge";

interface PriceSummaryProps {
  calculation: PriceCalculation;
  departement: string;
}

export const PriceSummary = ({ calculation, departement }: PriceSummaryProps) => {
  return (
    <Card className="border-primary/30">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="text-5xl font-bold text-primary">
              {calculation.prixTotal.toFixed(2)} €
            </div>
            <p className="text-muted-foreground">Prix total TTC</p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Département</p>
              <p className="text-lg font-semibold">{departement}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Chevaux fiscaux</p>
              <p className="text-lg font-semibold">{calculation.chevauxFiscaux} CV</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Ancienneté</p>
              <p className="text-lg font-semibold">{calculation.anciennete} ans</p>
            </div>
          </div>

          {calculation.abattement && (
            <Badge variant="secondary" className="w-full justify-center py-2">
              👉 Abattement -50% appliqué (véhicule de plus de 10 ans)
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
