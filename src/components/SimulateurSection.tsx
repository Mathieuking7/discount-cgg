import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DepartmentSelect } from "@/components/simulateur/DepartmentSelect";
import { Loader2, Calculator, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getVehicleByPlate } from "@/lib/vehicle-api";
import { Input } from "@/components/ui/input";

export const SimulateurSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [departement, setDepartement] = useState("");
  const [plaque, setPlaque] = useState("");
  const [loading, setLoading] = useState(false);
  const [prixBase, setPrixBase] = useState(29.90);

  useEffect(() => {
    const fetchPrixBase = async () => {
      try {
        const { data, error } = await supabase
          .from('guest_demarche_types')
          .select('prix_base')
          .eq('code', 'CG')
          .single();

        if (!error && data) {
          setPrixBase(data.prix_base);
        }
      } catch (error) {
        console.error('Error fetching prix_base:', error);
      }
    };
    fetchPrixBase();
  }, []);

  const validatePlate = (plate: string) => {
    const newFormat = /^[A-Z]{2}-?\d{3}-?[A-Z]{2}$/i;
    const oldFormat = /^\d{1,4}[\s-]?[A-Z]{2,3}[\s-]?\d{2}$/i;
    return newFormat.test(plate) || oldFormat.test(plate);
  };

  const isFormValid = () => {
    return plaque && validatePlate(plaque) && departement;
  };

  const formatPlateDisplay = (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (/^\d/.test(clean)) {
      const match = clean.match(/^(\d{1,4})([A-Z]{2,3})(\d{0,2})$/);
      if (match) {
        const [, numbers, letters, dept] = match;
        return dept ? `${numbers} ${letters} ${dept}` : letters ? `${numbers} ${letters}` : numbers;
      }
      return clean;
    }

    if (clean.length <= 2) return clean;
    if (clean.length <= 5) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
    return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5, 7)}`;
  };

  const isOldPlate = plaque && /^\d/.test(plaque.replace(/[^A-Z0-9]/gi, ''));

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    let formatted = value.replace(/[^A-Z0-9\s-]/g, '');
    setPlaque(formatted);
  };

  const handleCalculate = async () => {
    if (!isFormValid()) return;

    setLoading(true);
    try {
      const apiResponse = await getVehicleByPlate(plaque);

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error || 'Impossible de recuperer les informations du vehicule');
      }

      const vehicleData = {
        dateMiseEnCirculation: apiResponse.data.date_mec,
        chevauxFiscaux: apiResponse.data.puissance_fiscale,
      };

      if (!vehicleData.dateMiseEnCirculation || !vehicleData.chevauxFiscaux) {
        throw new Error('Donnees du vehicule incompletes');
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
          montant_ttc: 0,
          frais_dossier: prixBase,
          status: 'en_attente',
          paye: false,
          demarche_type: 'CG',
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/resultat-carte-grise?orderId=${order.id}&departement=${departement}&plaque=${plaque}`, {
        state: { vehicleData, departement, plaque },
      });
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

  const displayPlate = plaque ? formatPlateDisplay(plaque) : "AA-123-AA";
  const displayDept = departement || "75";
  const showOldPlate = isOldPlate;

  return (
    <section className="py-20 bg-[#FDF8F0]" id="simulateur">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 mb-4">
            <Calculator className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Calculez votre carte grise
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Entrez votre immatriculation et obtenez le prix instantanement
          </p>
        </div>

        <div className="max-w-xl mx-auto bg-white border border-gray-100 shadow-sm rounded-3xl p-8">
          {/* Plaque d'immatriculation visuelle */}
          <div className="mb-10 flex justify-center">
            {showOldPlate ? (
              <div className="w-full max-w-lg h-20 md:h-24 rounded-xl border-[3px] border-black shadow-lg relative overflow-hidden bg-[#F4C430]">
                <div className="absolute inset-[3px] rounded-lg border border-black/20" />
                <div className="absolute inset-y-0 left-0 w-12 md:w-14 bg-[#003399] flex flex-col items-center justify-between py-1.5 md:py-2 rounded-l-lg">
                  <div className="relative w-8 h-8 md:w-9 md:h-9">
                    {[...Array(12)].map((_, i) => {
                      const angle = (i * 30 - 90) * (Math.PI / 180);
                      const x = 50 + 38 * Math.cos(angle);
                      const y = 50 + 38 * Math.sin(angle);
                      return (
                        <span
                          key={i}
                          className="absolute text-[#FFCC00] text-[6px] md:text-[7px]"
                          style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                          *
                        </span>
                      );
                    })}
                  </div>
                  <span className="text-white font-bold text-sm md:text-base">F</span>
                </div>
                <div className="absolute inset-y-0 left-12 md:left-14 right-0 flex items-center justify-center bg-[#F4C430]">
                  <span className="text-2xl md:text-4xl font-black tracking-wider text-black" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    {displayPlate}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-lg h-20 md:h-24 rounded-xl border-[3px] border-gray-800 shadow-lg relative overflow-hidden bg-white">
                <div className="absolute inset-[3px] rounded-lg border border-gray-300" />
                <div className="absolute inset-y-0 left-0 w-12 md:w-14 bg-[#003399] flex flex-col items-center justify-between py-1.5 md:py-2 rounded-l-lg">
                  <div className="relative w-8 h-8 md:w-9 md:h-9">
                    {[...Array(12)].map((_, i) => {
                      const angle = (i * 30 - 90) * (Math.PI / 180);
                      const x = 50 + 38 * Math.cos(angle);
                      const y = 50 + 38 * Math.sin(angle);
                      return (
                        <span
                          key={i}
                          className="absolute text-[#FFCC00] text-[6px] md:text-[7px]"
                          style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                          *
                        </span>
                      );
                    })}
                  </div>
                  <span className="text-white font-bold text-sm md:text-base">F</span>
                </div>
                <div className="absolute inset-y-0 left-12 md:left-14 right-12 md:right-14 flex items-center justify-center bg-white">
                  <span className="text-2xl md:text-4xl font-black tracking-wider text-gray-900" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    {displayPlate}
                  </span>
                </div>
                <div className="absolute inset-y-0 right-0 w-12 md:w-14 bg-[#003399] flex items-center justify-center rounded-r-lg">
                  <span className="text-white font-bold text-lg md:text-xl">{displayDept}</span>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Immatriculation</label>
              <Input
                type="text"
                placeholder="AA-123-AA ou 123 ABC 75"
                value={plaque}
                onChange={handlePlateChange}
                className="text-center text-lg font-mono uppercase h-12 rounded-xl border-gray-200 bg-gray-50 focus:ring-amber-400 focus:border-amber-400"
                maxLength={12}
              />
            </div>

            <DepartmentSelect
              value={departement}
              onChange={setDepartement}
            />

            <button
              onClick={handleCalculate}
              disabled={!isFormValid() || loading}
              className="w-full h-14 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-lg rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Calcul en cours...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  Calculer le prix
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center pt-2">
              Tarifs officiels en vigueur - Service habilite
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
