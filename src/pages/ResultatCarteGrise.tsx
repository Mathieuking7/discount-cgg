import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { PriceSummary } from "@/components/simulateur/PriceSummary";
import { DetailsCollapse } from "@/components/simulateur/DetailsCollapse";
import { PaymentMethods } from "@/components/payment/PaymentMethods";
import { UploadList } from "@/components/upload/UploadList";
import { calculatePrice, PriceCalculation } from "@/utils/calculatePrice";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ResultatCarteGrise() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [calculation, setCalculation] = useState<PriceCalculation | null>(null);
  const [orderId, setOrderId] = useState<string>("");
  const [departement, setDepartement] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const orderIdParam = searchParams.get('orderId');
        const departementParam = searchParams.get('departement');
        const vehicleData = location.state?.vehicleData;

        if (!orderIdParam || !departementParam || !vehicleData) {
          toast({
            title: "Erreur",
            description: "Données manquantes",
            variant: "destructive",
          });
          navigate('/simulateur');
          return;
        }

        setOrderId(orderIdParam);
        setDepartement(departementParam);

        // Calculer le prix
        const calc = calculatePrice(
          departementParam,
          vehicleData.chevauxFiscaux,
          vehicleData.dateMiseEnCirculation
        );

        setCalculation(calc);

        // Mettre à jour la commande avec le prix calculé
        const { error } = await supabase
          .from('guest_orders')
          .update({
            montant_ht: calc.prixTotal,
            montant_ttc: calc.prixTotal,
            puiss_fisc: vehicleData.chevauxFiscaux,
            date_mec: vehicleData.dateMiseEnCirculation,
          })
          .eq('id', orderIdParam);

        if (error) throw error;

      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchParams, location.state, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!calculation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/simulateur')}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Nouvelle simulation
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <PriceSummary
              calculation={calculation}
              departement={departement}
            />

            <DetailsCollapse calculation={calculation} />
          </div>

          <div className="space-y-6">
            <PaymentMethods
              amount={calculation.prixTotal}
              orderId={orderId}
              onPaymentSuccess={() => setIsPaid(true)}
            />

            <UploadList
              orderId={orderId}
              isPaid={isPaid}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
