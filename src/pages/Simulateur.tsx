import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SEOHead from "@/components/SEOHead";
import { DepartmentSelect } from "@/components/simulateur/DepartmentSelect";
import { PlateInput } from "@/components/simulateur/PlateInput";
import { Loader2, Calculator, FileText, ArrowRightLeft, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getVehicleByPlate } from "@/lib/vehicle-api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/config/site.config";

type DemarcheType = "CG" | "DA" | "DC";

interface DemarcheTypeInfo {
  label: string;
  description: string;
  icon: React.ReactNode;
  prix: number;
  needsVehicleApi: boolean;
  color: string;
}

const demarcheTypes: Record<DemarcheType, DemarcheTypeInfo> = {
  CG: {
    label: "Demande de carte grise",
    description: "Changement de titulaire avec nouvelle immatriculation",
    icon: <Car className="w-5 h-5" />,
    prix: 30,
    needsVehicleApi: true,
    color: "bg-blue-100 text-blue-600 border-blue-200",
  },
  DA: {
    label: "Declaration d'achat",
    description: "Pour les professionnels qui achetent un vehicule",
    icon: <FileText className="w-5 h-5" />,
    prix: 10,
    needsVehicleApi: false,
    color: "bg-amber-100 text-amber-600 border-amber-200",
  },
  DC: {
    label: "Declaration de cession",
    description: "Pour declarer la vente de votre vehicule",
    icon: <ArrowRightLeft className="w-5 h-5" />,
    prix: 10,
    needsVehicleApi: false,
    color: "bg-purple-100 text-purple-600 border-purple-200",
  },
};

export default function Simulateur() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [demarcheType, setDemarcheType] = useState<DemarcheType>("CG");
  const [departement, setDepartement] = useState("");
  const [plaque, setPlaque] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePlate = (plate: string) => {
    const newFormat = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/i;
    const oldFormat = /^\d{3,4}-[A-Z]{3}-\d{2}$/i;
    return newFormat.test(plate) || oldFormat.test(plate);
  };

  const currentDemarche = demarcheTypes[demarcheType];
  const needsDepartement = demarcheType === "CG";
  const isFormValid = plaque && validatePlate(plaque) && (needsDepartement ? departement : true);

  const handleCalculate = async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
      let vehicleData = null;

      if (currentDemarche.needsVehicleApi) {
        const apiResponse = await getVehicleByPlate(plaque);

        if (!apiResponse.success || !apiResponse.data) {
          throw new Error(apiResponse.error || 'Impossible de recuperer les informations du vehicule');
        }

        vehicleData = {
          dateMiseEnCirculation: apiResponse.data.date_mec,
          chevauxFiscaux: Number(apiResponse.data.puissance_fiscale) || 0,
        };

        if (!vehicleData.dateMiseEnCirculation || !vehicleData.chevauxFiscaux) {
          throw new Error('Donnees du vehicule incompletes');
        }
      }

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
          montant_ttc: currentDemarche.prix,
          frais_dossier: currentDemarche.prix,
          status: 'en_attente',
          paye: false,
          demarche_type: demarcheType,
        })
        .select()
        .single();

      if (error) throw error;

      if (demarcheType === "CG") {
        navigate(`/resultat-carte-grise?orderId=${order.id}&departement=${departement}&plaque=${plaque}`, {
          state: { vehicleData, departement, plaque },
        });
      } else {
        navigate(`/demarche-simple?orderId=${order.id}&type=${demarcheType}&plaque=${plaque}`, {
          state: { demarcheType, plaque },
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={`Simulateur Prix Carte Grise | Calculez le Cout en Ligne - ${siteConfig.siteName}`}
        description="Calculez instantanement le prix de votre carte grise. Simulateur gratuit, tarifs taxes par departement, frais de service inclus."
        canonicalUrl={`${siteConfig.baseUrl}/simulateur`}
      />
      <Navbar />

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#002395] mb-3">Simulateur</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-2">
              Simulateur de Prix
            </h1>
            <p className="text-gray-500 text-lg">
              Selectionnez votre demarche et calculez le prix
            </p>
          </div>

          {/* Form */}
          <div className="border-t border-gray-200 pt-8">
            <div className="space-y-8">
              {/* Demarche type */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">Type de demarche</label>
                <div className="space-y-3">
                  {(Object.entries(demarcheTypes) as [DemarcheType, DemarcheTypeInfo][]).map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => setDemarcheType(key)}
                      className={`flex items-center gap-4 p-4 rounded-md border transition-all text-left w-full min-h-[48px] ${
                        demarcheType === key
                          ? "border-[#002395] bg-blue-50/50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                        demarcheType === key ? "bg-[#002395] text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        {info.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${demarcheType === key ? "text-[#1A1A1A]" : "text-gray-600"}`}>
                          {info.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{info.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        demarcheType === key ? "border-[#002395] bg-[#002395]" : "border-gray-300"
                      }`}>
                        {demarcheType === key && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Departement */}
              {needsDepartement && (
                <div className="border-t border-gray-100 pt-6">
                  <DepartmentSelect
                    value={departement}
                    onChange={setDepartement}
                  />
                </div>
              )}

              <div className="border-t border-gray-100 pt-6">
                <PlateInput
                  value={plaque}
                  onChange={setPlaque}
                />
              </div>

              {/* Price display */}
              <div className="border-l-4 border-[#002395] pl-4 py-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Prix de la demarche :</span>
                  <span className="text-lg font-bold text-[#1A1A1A]">
                    {demarcheType === "CG"
                      ? "Calcul apres validation"
                      : `${currentDemarche.prix} EUR`
                    }
                  </span>
                </div>
              </div>

              <button
                onClick={handleCalculate}
                disabled={!isFormValid || loading}
                className="w-full min-h-[48px] h-14 bg-[#002395] hover:bg-[#001a75] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-lg rounded-md transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {demarcheType === "CG" ? "Calcul en cours..." : "Creation en cours..."}
                  </>
                ) : (
                  <>
                    {currentDemarche.icon}
                    <span>
                      {demarcheType === "CG" ? "Calculer le prix" : "Commencer la demarche"}
                    </span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                {demarcheType === "CG"
                  ? "Le calcul est base sur les tarifs officiels en vigueur"
                  : "Vous pourrez deposer vos documents apres le paiement"
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
