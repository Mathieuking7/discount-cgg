import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Car,
  FileCheck,
  MapPin,
  Copy,
  PlusCircle,
  Globe,
  Search,
  PenTool,
  ScrollText,
  Users,
  Receipt,
  Home,
  Bike,
  XCircle,
  ClipboardList,
  CheckCircle,
  ShieldCheck,
  Lock,
  Clock,
  Loader2,
  ArrowRight,
  ChevronRight,
  Star,
  BadgeCheck,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import SEOHead from "@/components/SEOHead";
import SchemaOrg, {
  sivflowDemarcheServiceSchema,
  sivflowBreadcrumbSchema,
} from "@/components/SchemaOrg";

const DEMARCHE_CONFIG: Record<string, { code: string; icon: any; color: string }> = {
  'carte-grise': { code: 'CG', icon: Car, color: 'blue' },
  'declaration-cession': { code: 'DC', icon: FileCheck, color: 'green' },
  'changement-adresse': { code: 'CHGT_ADRESSE', icon: MapPin, color: 'amber' },
  'duplicata': { code: 'DUPLICATA', icon: Copy, color: 'purple' },
  'vehicule-neuf': { code: 'CG_NEUF', icon: PlusCircle, color: 'teal' },
  'carte-grise-import': { code: 'CPI_WW', icon: Globe, color: 'indigo' },
  'fiv': { code: 'FIV', icon: Search, color: 'sky' },
  'modification-carte-grise': { code: 'MODIF_CG', icon: PenTool, color: 'orange' },
  'succession': { code: 'SUCCESSION', icon: ScrollText, color: 'rose' },
  'cotitulaire': { code: 'COTITULAIRE', icon: Users, color: 'violet' },
  'quitus-fiscal': { code: 'QUITUS_FISCAL', icon: Receipt, color: 'emerald' },
  'changement-adresse-locataire': { code: 'CHGT_ADRESSE_LOCATAIRE', icon: Home, color: 'cyan' },
  'immatriculation-cyclomoteur': { code: 'IMMAT_CYCLO_ANCIEN', icon: Bike, color: 'lime' },
  'annuler-cpi-ww': { code: 'ANNULER_CPI_WW', icon: XCircle, color: 'red' },
  'demande-immatriculation': { code: 'DEMANDE_IMMAT', icon: ClipboardList, color: 'slate' },
};

const COLOR_CLASSES: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  sky: { bg: 'bg-sky-100', text: 'text-sky-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-600' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  lime: { bg: 'bg-lime-100', text: 'text-lime-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

const validatePlate = (plate: string) => {
  const formats = [
    /^[A-Z]{2}-\d{3}-[A-Z]{2}$/i,
    /^[A-Z]{2}\d{3}[A-Z]{2}$/i,
    /^\d{1,4}\s?[A-Z]{1,3}\s?\d{2,3}$/i,
  ];
  return formats.some((f) => f.test(plate.trim()));
};

// Only carte-grise (CG) should show "Calculer le prix" and redirect to simulateur
const isCarteGrise = (slug: string) => slug === 'carte-grise';

const DemarcheParticulier = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [demarcheData, setDemarcheData] = useState<any>(null);
  const [requiredDocs, setRequiredDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [plaque, setPlaque] = useState("");

  const config = slug ? DEMARCHE_CONFIG[slug] : null;

  useEffect(() => {
    if (!config) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [demarcheRes, docsRes] = await Promise.all([
          supabase
            .from("guest_demarche_types")
            .select("titre, description, prix_base, require_carte_grise_price, require_vehicle_info")
            .eq("code", config.code)
            .eq("actif", true)
            .single(),
          supabase
            .from("guest_order_required_documents")
            .select("nom_document")
            .eq("demarche_type_code", config.code)
            .order("ordre", { ascending: true }),
        ]);

        if (demarcheRes.error) throw demarcheRes.error;
        setDemarcheData(demarcheRes.data);
        setRequiredDocs(docsRes.data || []);
      } catch (err) {
        console.error("Error loading demarche data:", err);
        toast({
          title: "Erreur",
          description: "Impossible de charger les informations de cette demarche.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [config?.code]);

  if (!config) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Demarche introuvable</h1>
            <p className="text-gray-500">Cette demarche n'existe pas ou n'est plus disponible.</p>
            <Link to="/" className="inline-flex items-center gap-2 text-[#1B2A4A] font-medium hover:underline">
              <ChevronRight className="w-4 h-4 rotate-180" /> Retour a l'accueil
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = config.icon;
  const colors = COLOR_CLASSES[config.color] || COLOR_CLASSES.blue;

  const needsPlate = demarcheData?.require_vehicle_info !== false;

  const handleCommencer = async () => {
    if (needsPlate && (!plaque || !validatePlate(plaque))) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une immatriculation valide",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const { data: order, error } = await supabase
        .from("guest_orders")
        .insert({
          tracking_number: "",
          immatriculation: needsPlate ? plaque.trim().toUpperCase() : "",
          email: "",
          telephone: "",
          nom: "",
          prenom: "",
          adresse: "",
          code_postal: "",
          ville: "",
          montant_ht: demarcheData.prix_base,
          montant_ttc: demarcheData.prix_base,
          frais_dossier: demarcheData.prix_base,
          status: "en_attente",
          paye: false,
          demarche_type: config.code,
        })
        .select()
        .single();

      if (error) throw error;
      navigate(`/commander/${order.id}`);
    } catch (err) {
      console.error("Error creating order:", err);
      toast({
        title: "Erreur",
        description: "Impossible de creer votre commande. Veuillez reessayer.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!demarcheData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Demarche indisponible</h1>
            <p className="text-gray-500">Cette demarche n'est pas disponible pour le moment.</p>
            <Link to="/" className="inline-flex items-center gap-2 text-[#1B2A4A] font-medium hover:underline">
              <ChevronRight className="w-4 h-4 rotate-180" /> Retour a l'accueil
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isCG = isCarteGrise(slug || "");

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB]">
      <SEOHead
        title={`${demarcheData.titre} - SIVFlow`}
        description={demarcheData.description}
        canonicalUrl={`https://sivflow.fr/demarches/${slug}`}
      />
      <SchemaOrg
        schema={[
          sivflowDemarcheServiceSchema({
            titre: demarcheData.titre,
            description: demarcheData.description,
            prix_base: demarcheData.prix_base,
            slug: slug || "",
          }),
          sivflowBreadcrumbSchema([
            { name: "Accueil", url: "https://sivflow.fr/" },
            { name: "Demarches", url: "https://sivflow.fr/#demarches-particulier" },
            { name: demarcheData.titre, url: `https://sivflow.fr/demarches/${slug}` },
          ]),
        ]}
      />
      <Navbar />

      {/* Trust bar */}
      <div className="bg-[#1B2A4A] py-2 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-6 text-white text-xs">
          <span className="flex items-center gap-1.5">
            <BadgeCheck size={14} className="text-amber-400" />
            <span className="text-white/70">Service habilite ANTS</span>
          </span>
          <span className="hidden sm:block w-px h-3 bg-white/20" />
          <span className="hidden sm:flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
            ))}
            <span className="text-white/70 ml-1">4.8/5</span>
          </span>
          <span className="hidden sm:block w-px h-3 bg-white/20" />
          <span className="hidden sm:flex items-center gap-1">
            <Lock size={12} className="text-green-400" />
            <span className="text-white/70">Paiement securise</span>
          </span>
        </div>
      </div>

      <main id="main-content" className="flex-1 px-4 py-6 sm:py-10">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-encre/70 mb-6">
            <Link to="/" className="hover:text-bleu-france transition-colors">Accueil</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="text-encre/70">{demarcheData.titre}</span>
          </nav>

          {/* Main card - everything compact */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 sm:p-8 pb-0">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-encre leading-tight">
                    {demarcheData.titre}
                  </h1>
                  <p className="text-sm text-encre/50 mt-1 leading-relaxed">
                    {demarcheData.description}
                  </p>
                </div>
              </div>

              {/* Price badge */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="inline-flex items-baseline gap-1 bg-[#1B2A4A] text-white px-4 py-2 rounded-xl">
                  <span className="text-2xl font-bold">{demarcheData.prix_base}</span>
                  <span className="text-sm text-white/60">EUR</span>
                </div>
                {isCG && (
                  <span className="text-xs text-amber-600 font-medium">+ taxe regionale</span>
                )}
                <div className="flex items-center gap-3 sm:ml-auto">
                  <span className="flex items-center gap-1 text-xs text-encre/70">
                    <ShieldCheck size={12} /> ANTS
                  </span>
                  <span className="flex items-center gap-1 text-xs text-encre/70">
                    <Clock size={12} /> 24h
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Documents requis */}
            {requiredDocs.length > 0 && (
              <div className="p-6 sm:p-8 pb-0">
                <h2 className="text-sm font-semibold text-encre mb-3 flex items-center gap-2">
                  <FileText size={15} className="text-encre/70" />
                  Documents necessaires
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {requiredDocs.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2.5 py-2 px-3 bg-[#F8F9FB] rounded-lg">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      <span className="text-sm text-encre/80">{doc.nom_document}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-100 mt-6" />

            {/* Action section */}
            <div className="p-6 sm:p-8">
              {isCG ? (
                /* Carte grise → simulateur pour calculer le prix */
                <button
                  onClick={() => navigate("/simulateur")}
                  className="w-full min-h-[48px] h-14 bg-bleu-france hover:bg-bleu-france/90 text-white font-semibold rounded-xl text-sm sm:text-base transition flex items-center justify-center gap-2"
                >
                  Calculer le prix de ma carte grise <ArrowRight size={18} />
                </button>
              ) : (
                /* Toutes les autres démarches */
                <div className="space-y-3">
                  {needsPlate && (
                    <div>
                      <label className="text-sm font-medium text-encre/60 mb-1.5 block">
                        Immatriculation du vehicule
                      </label>
                      <Input
                        placeholder="AA-123-AA"
                        value={plaque}
                        onChange={(e) => setPlaque(e.target.value.toUpperCase())}
                        className="h-12 text-center text-lg font-mono tracking-wider border-gray-300 rounded-xl"
                      />
                    </div>
                  )}
                  <button
                    onClick={handleCommencer}
                    disabled={submitting}
                    className="w-full min-h-[48px] h-14 bg-bleu-france hover:bg-bleu-france/90 text-white font-semibold rounded-xl text-sm sm:text-base transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Commencer ma demarche <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DemarcheParticulier;
