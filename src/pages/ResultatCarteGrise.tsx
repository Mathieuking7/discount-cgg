import { useEffect, useState } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PriceSummary } from "@/components/simulateur/PriceSummary";
import { DetailsCollapse } from "@/components/simulateur/DetailsCollapse";
import { PaymentMethods } from "@/components/payment/PaymentMethods";
import { UploadList } from "@/components/upload/UploadList";
import { GuestOrderInfoForm } from "@/components/GuestOrderInfoForm";
import { calculatePrice, PriceCalculation } from "@/utils/calculatePrice";
import { getVehicleByPlate, NormalizedVehicleData } from "@/lib/vehicle-api";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronLeft, Mail, MessageSquare, Bell, Zap, FileSearch, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  const [vehicleInfo, setVehicleInfo] = useState<NormalizedVehicleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [isInfoCompleted, setIsInfoCompleted] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(false);
  const [dossierPrioritaire, setDossierPrioritaire] = useState(false);
  const [certificatNonGage, setCertificatNonGage] = useState(false);

  const emailPrix = 5;
  const dossierPrioritairePrix = 5;
  const certificatNonGagePrix = 10;
  const fraisDossier = 30;

  const calculateTotalTTC = () => {
    if (!calculation) return 0;
    const prixCarteGrise = calculation.prixTotal;
    let optionsPrix = 0;
    if (emailNotifications) optionsPrix += emailPrix;
    if (dossierPrioritaire) optionsPrix += dossierPrioritairePrix;
    if (certificatNonGage) optionsPrix += certificatNonGagePrix;
    const totalServicesHT = fraisDossier + optionsPrix;
    return prixCarteGrise + totalServicesHT;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const orderIdParam = searchParams.get('orderId');
        const departementParam = searchParams.get('departement');
        const plaqueParam = searchParams.get('plaque');
        const vehicleData = location.state?.vehicleData;

        if (!orderIdParam || !departementParam || !vehicleData) {
          toast({ title: "Erreur", description: "Donnees manquantes", variant: "destructive" });
          navigate('/simulateur');
          return;
        }

        setOrderId(orderIdParam);
        setDepartement(departementParam);

        const { data: tarifData } = await supabase
          .from("department_tariffs")
          .select("tarif")
          .eq("code", departementParam)
          .single();

        if (!tarifData) {
          toast({ title: "Erreur", description: "Departement non trouve", variant: "destructive" });
          navigate('/simulateur');
          return;
        }

        if (plaqueParam) {
          const vehicleResponse = await getVehicleByPlate(plaqueParam);
          if (vehicleResponse.success && vehicleResponse.data) {
            setVehicleInfo(vehicleResponse.data);
          }
        }

        const calc = calculatePrice(
          tarifData.tarif,
          vehicleData.chevauxFiscaux,
          vehicleData.dateMiseEnCirculation
        );

        setCalculation(calc);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({ title: "Erreur", description: "Impossible de charger les donnees", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchParams, location.state, navigate, toast]);

  useEffect(() => {
    const updateOrder = async () => {
      if (!orderId || !calculation) return;

      const prixCarteGrise = calculation.prixTotal;
      let optionsPrix = 0;
      if (emailNotifications) optionsPrix += emailPrix;
      if (dossierPrioritaire) optionsPrix += dossierPrioritairePrix;
      if (certificatNonGage) optionsPrix += certificatNonGagePrix;

      const totalServicesHT = fraisDossier + optionsPrix;
      const montantTTC = prixCarteGrise + totalServicesHT;

      await supabase
        .from('guest_orders')
        .update({
          montant_ht: prixCarteGrise,
          montant_ttc: montantTTC,
          frais_dossier: fraisDossier,
          sms_notifications: false,
          email_notifications: emailNotifications,
          dossier_prioritaire: dossierPrioritaire,
          certificat_non_gage: certificatNonGage,
          marque: vehicleInfo?.marque || null,
          modele: vehicleInfo?.modele || null,
          energie: vehicleInfo?.energie || null,
          date_mec: vehicleInfo?.date_mec || null,
          puiss_fisc: calculation.chevauxFiscaux,
        })
        .eq('id', orderId);
    };

    updateOrder();
  }, [orderId, calculation, emailNotifications, dossierPrioritaire, certificatNonGage, vehicleInfo, fraisDossier]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0]">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!calculation) return null;

  const stepClasses = (active: boolean) =>
    active
      ? "bg-amber-500 text-white shadow-md"
      : "bg-gray-200 text-gray-400";

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour au simulateur
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Options */}
            {!isPaid && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${stepClasses(true)}`}>1</div>
                  <h2 className="text-2xl font-bold text-gray-900">Options</h2>
                </div>

                {/* Extra options */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-gray-900">Options supplementaires</h3>
                  </div>
                  <div className="space-y-3">
                    <label
                      className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        dossierPrioritaire ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <Checkbox
                        id="dossier_prioritaire"
                        checked={dossierPrioritaire}
                        onCheckedChange={(checked) => setDossierPrioritaire(checked as boolean)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-orange-500" />
                            Dossier Prioritaire
                          </span>
                          <span className="text-orange-500 font-semibold">+{dossierPrioritairePrix},00 EUR</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          Demarche traitee en priorite, delais plus rapides
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        certificatNonGage ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <Checkbox
                        id="certificat_non_gage"
                        checked={certificatNonGage}
                        onCheckedChange={(checked) => setCertificatNonGage(checked as boolean)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                            <FileSearch className="w-4 h-4 text-blue-500" />
                            Certificat de non-gage
                          </span>
                          <span className="text-blue-500 font-semibold">+{certificatNonGagePrix},00 EUR</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          Recommande pour verifier qu'aucun bloquant n'empeche la vente
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Tracking options */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-gray-900">Options de suivi</h3>
                  </div>
                  <div className="space-y-3">
                    <label
                      className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        emailNotifications ? 'border-amber-400 bg-amber-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <Checkbox
                        id="email_notif"
                        checked={emailNotifications}
                        onCheckedChange={(checked) => setEmailNotifications(checked as boolean)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                            <Mail className="w-4 h-4 text-amber-500" />
                            Suivi par email
                          </span>
                          <span className="text-amber-500 font-semibold">+{emailPrix},00 EUR</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          Recevez les mises a jour de votre dossier par email
                        </p>
                      </div>
                    </label>

                    <div className="flex items-start gap-3 p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed">
                      <Checkbox id="sms_notif" checked={false} disabled={true} className="mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-400 flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4" />
                            Suivi par SMS
                          </span>
                          <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">A venir</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">Bientot disponible</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${stepClasses(true)}`}>2</div>
                <h2 className="text-2xl font-bold text-gray-900">Payer votre commande</h2>
              </div>
              <PaymentMethods
                amount={calculateTotalTTC()}
                orderId={orderId}
                onPaymentSuccess={() => setIsPaid(true)}
              />
            </div>

            {/* Step 3: Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${stepClasses(isPaid)}`}>3</div>
                <h2 className="text-2xl font-bold text-gray-900">Vos informations</h2>
              </div>
              <GuestOrderInfoForm
                orderId={orderId}
                isPaid={isPaid}
                onComplete={() => setIsInfoCompleted(true)}
              />
            </div>

            {/* Step 4: Documents */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${stepClasses(isPaid && isInfoCompleted)}`}>4</div>
                <h2 className="text-2xl font-bold text-gray-900">Envoyer vos documents</h2>
              </div>
              <UploadList
                orderId={orderId}
                isPaid={isPaid && isInfoCompleted}
              />
            </div>
          </div>

          {/* Right side - Price Summary */}
          <div className="space-y-6">
            <PriceSummary
              calculation={calculation}
              departement={departement}
              vehicleInfo={vehicleInfo || undefined}
              fraisDossier={fraisDossier}
              selectedOptions={{
                smsNotifications: false,
                emailNotifications,
                packNotifications: false,
                dossierPrioritaire,
                certificatNonGage,
              }}
              isPaid={isPaid}
            />
            <DetailsCollapse calculation={calculation} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
