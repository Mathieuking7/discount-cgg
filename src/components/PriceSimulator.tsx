import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getVehicleByPlate, calculateCarteGrisePrice, getFraisDossier } from "@/lib/vehicle-api";
import { supabase } from "@/integrations/supabase/client";

export const PriceSimulator = () => {
  const [plate, setPlate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fraisDossier, setFraisDossier] = useState<number>(30);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    getFraisDossier().then(setFraisDossier);
  }, []);

  const handleSearch = async () => {
    if (!plate || plate.length < 6) {
      toast({
        title: "Plaque invalide",
        description: "Veuillez entrer une plaque d'immatriculation valide",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await getVehicleByPlate(plate);
      
      if (result.success && result.data) {
        const calculatedPrice = await calculateCarteGrisePrice(result.data);
        
        const { data: orderData, error: orderError } = await supabase
          .from("guest_orders")
          .insert([{
            tracking_number: "",
            immatriculation: plate,
            marque: result.data.marque || "",
            modele: result.data.modele || "",
            date_mec: result.data.date_mec || "",
            puiss_fisc: result.data.puissance_fiscale || 0,
            energie: result.data.energie || "",
            montant_ht: calculatedPrice,
            montant_ttc: calculatedPrice + fraisDossier,
            frais_dossier: fraisDossier,
            email: "",
            telephone: "",
            nom: "",
            prenom: "",
            adresse: "",
            code_postal: "",
            ville: "",
            status: "en_attente",
            demarche_type: "CG",
          }])
          .select()
          .single();

        if (orderError) throw orderError;

        toast({
          title: "Véhicule trouvé ! ✅",
          description: "Redirection vers votre devis...",
        });

        navigate(`/devis/${orderData.id}`);
      } else {
        toast({
          title: "Véhicule non trouvé",
          description: "Impossible de trouver les informations pour cette plaque",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-2xl border-2 border-primary/30 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground pb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Car className="w-10 h-10" />
          <CardTitle className="text-3xl md:text-4xl font-black text-center">
            Simulateur de Prix Carte Grise
          </CardTitle>
        </div>
        <CardDescription className="text-primary-foreground/90 text-center text-lg font-medium">
          Obtenez un devis instantané en entrant votre plaque d'immatriculation
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-8 space-y-8">
        <div className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="plate" className="text-xl font-bold text-foreground flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              Plaque d'immatriculation
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">SIV</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Nouveau format</p>
                  <p className="font-mono font-bold text-sm">AA-123-AA</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary/5 border border-border rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                  <span className="text-secondary-foreground font-bold text-sm">FNI</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Ancien format</p>
                  <p className="font-mono font-bold text-sm">1234 ABC 45</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Input
              id="plate"
              placeholder="Ex: AB-123-CD"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              className="text-2xl font-mono uppercase h-16 text-center tracking-widest border-2 border-primary/30 focus:border-primary shadow-lg"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              size="lg"
              className="px-8 h-16 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Search className="w-6 h-6 mr-2" />
                  Rechercher
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
