import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DepartmentSelect } from "@/components/simulateur/DepartmentSelect";
import { PlateInput } from "@/components/simulateur/PlateInput";
import { Loader2, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// TODO: Remplacer par votre URL d'API réelle
const API_URL = "VOTRE_URL_API_ICI";
const API_KEY = "VOTRE_CLE_API_ICI";

export default function Simulateur() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [departement, setDepartement] = useState("");
  const [plaque, setPlaque] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePlate = (plate: string) => {
    const newFormat = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/i;
    const oldFormat = /^\d{3,4}-[A-Z]{3}-\d{2}$/i;
    return newFormat.test(plate) || oldFormat.test(plate);
  };

  const isFormValid = departement && plaque && validatePlate(plaque);

  const handleCalculate = async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
      // Appel à l'API externe
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ plaque }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données du véhicule');
      }

      const vehicleData = await response.json();
      
      if (!vehicleData.dateMiseEnCirculation || !vehicleData.chevauxFiscaux) {
        throw new Error('Données du véhicule incomplètes');
      }

      // Créer une commande dans la base de données
      const { data: order, error } = await supabase
        .from('guest_orders')
        .insert({
          tracking_number: '',
          immatriculation: plaque,
          email: '',
          telephone: '',
          nom: '',
          prenom: '',
          adresse: '',
          code_postal: '',
          ville: '',
          montant_ht: 0,
          montant_ttc: 0,
          frais_dossier: 30,
          status: 'en_attente',
          paye: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Rediriger vers la page de résultats avec les données
      navigate(`/resultat-carte-grise?orderId=${order.id}&departement=${departement}&plaque=${plaque}`, {
        state: {
          vehicleData,
          departement,
          plaque,
        },
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de récupérer les informations du véhicule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl flex items-center justify-center gap-2">
                <Calculator className="w-8 h-8" />
                Simulateur de Prix
              </CardTitle>
              <CardDescription>
                Calculez instantanément le prix de votre carte grise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <DepartmentSelect
                value={departement}
                onChange={setDepartement}
              />

              <PlateInput
                value={plaque}
                onChange={setPlaque}
              />

              <Button
                onClick={handleCalculate}
                disabled={!isFormValid || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Calcul en cours...
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5 mr-2" />
                    Calculer le prix
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Le calcul est basé sur les tarifs officiels en vigueur
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};
