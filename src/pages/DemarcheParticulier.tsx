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
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Star,
  BadgeCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";

const DEMARCHE_CONFIG: Record<string, { code: string; icon: any; color: string; steps: string[] }> = {
  'carte-grise': { code: 'CG', icon: Car, color: 'blue', steps: ['Entrez votre immatriculation', 'Calculez le prix de votre carte grise', 'Payez en ligne de maniere securisee', 'Recevez votre carte grise sous 3-5 jours'] },
  'declaration-cession': { code: 'DC', icon: FileCheck, color: 'green', steps: ['Remplissez le formulaire de cession', 'Uploadez les documents requis', 'Payez les frais de dossier', 'Recevez votre certificat de cession'] },
  'changement-adresse': { code: 'CHGT_ADRESSE', icon: MapPin, color: 'amber', steps: ['Entrez votre nouvelle adresse', 'Fournissez un justificatif de domicile', 'Payez en ligne', 'Recevez votre nouvelle carte grise'] },
  'duplicata': { code: 'DUPLICATA', icon: Copy, color: 'purple', steps: ['Declarez la perte ou le vol', 'Uploadez les documents justificatifs', 'Payez les frais', 'Recevez votre duplicata'] },
  'vehicule-neuf': { code: 'CG_NEUF', icon: PlusCircle, color: 'teal', steps: ['Entrez les informations du vehicule', 'Fournissez le certificat de conformite', 'Payez en ligne', 'Recevez votre carte grise'] },
  'carte-grise-import': { code: 'CPI_WW', icon: Globe, color: 'indigo', steps: ['Fournissez les documents du pays d\'origine', 'Obtenez le quitus fiscal', 'Payez les frais d\'immatriculation', 'Recevez votre carte grise francaise'] },
  'fiv': { code: 'FIV', icon: Search, color: 'sky', steps: ['Entrez l\'immatriculation du vehicule', 'Consultez le fichier des vehicules', 'Obtenez les informations techniques', 'Telechargez votre rapport'] },
  'modification-carte-grise': { code: 'MODIF_CG', icon: PenTool, color: 'orange', steps: ['Selectionnez la modification souhaitee', 'Fournissez les justificatifs', 'Payez les frais', 'Recevez votre carte grise modifiee'] },
  'succession': { code: 'SUCCESSION', icon: ScrollText, color: 'rose', steps: ['Fournissez l\'acte de succession', 'Uploadez les documents du vehicule', 'Payez les frais de transfert', 'Recevez la carte grise a votre nom'] },
  'cotitulaire': { code: 'COTITULAIRE', icon: Users, color: 'violet', steps: ['Identifiez le cotitulaire', 'Fournissez les pieces d\'identite', 'Payez les frais', 'Recevez la carte grise mise a jour'] },
  'quitus-fiscal': { code: 'QUITUS_FISCAL', icon: Receipt, color: 'emerald', steps: ['Fournissez la facture d\'achat', 'Uploadez les documents du vehicule', 'Demandez le quitus aupres des impots', 'Recevez votre attestation fiscale'] },
  'changement-adresse-locataire': { code: 'CHGT_ADRESSE_LOCATAIRE', icon: Home, color: 'cyan', steps: ['Entrez la nouvelle adresse du locataire', 'Fournissez le contrat de location', 'Payez les frais', 'Recevez la carte grise mise a jour'] },
  'immatriculation-cyclomoteur': { code: 'IMMAT_CYCLO_ANCIEN', icon: Bike, color: 'lime', steps: ['Entrez les informations du cyclomoteur', 'Fournissez un justificatif de propriete', 'Payez les frais', 'Recevez votre carte grise'] },
  'annuler-cpi-ww': { code: 'ANNULER_CPI_WW', icon: XCircle, color: 'red', steps: ['Fournissez le numero CPI/WW', 'Uploadez les documents justificatifs', 'Confirmez l\'annulation', 'Recevez la confirmation'] },
  'demande-immatriculation': { code: 'DEMANDE_IMMAT', icon: ClipboardList, color: 'slate', steps: ['Remplissez la demande d\'immatriculation', 'Fournissez les documents requis', 'Payez les frais', 'Recevez votre certificat'] },
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
            .select("titre, description, prix_base, require_carte_grise_price")
            .eq("code", config.code)
            .eq("actif", true)
            .single(),
          supabase
            .from("guest_order_required_documents")
            .select("nom_document, description")
            .eq("demarche_type_code", config.code),
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
              <ArrowLeft className="w-4 h-4" /> Retour a l'accueil
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = config.icon;
  const colors = COLOR_CLASSES[config.color] || COLOR_CLASSES.blue;

  const handleCommencer = async () => {
    if (!plaque || !validatePlate(plaque)) {
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
          immatriculation: plaque.trim().toUpperCase(),
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
              <ArrowLeft className="w-4 h-4" /> Retour a l'accueil
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Tricolor bar */}
      <div className="h-1 flex">
        <div className="flex-1 bg-blue-700" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-red-600" />
      </div>

      {/* Trust bar */}
      <div className="bg-[#1B2A4A] py-2.5 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-6 text-white text-xs sm:text-sm">
          <span className="flex items-center gap-1.5">
            <BadgeCheck size={15} className="text-amber-400" />
            <span className="text-white/80">Service habilite par le Ministere de l'Interieur</span>
          </span>
          <span className="hidden sm:block w-px h-4 bg-white/20" />
          <span className="hidden sm:flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
            ))}
            <span className="text-white/80 ml-1">4.8/5 avis verifies</span>
          </span>
        </div>
      </div>

      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-gradient-to-b from-[#F0F4F8] to-white pt-8 pb-12 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-encre/50 mb-8">
              <Link to="/" className="hover:text-bleu-france transition-colors">Accueil</Link>
              <ChevronRight size={14} />
              <span className="text-encre font-medium">{demarcheData.titre}</span>
            </nav>

            <div className="grid lg:grid-cols-5 gap-12">
              {/* Left col (3/5) */}
              <div className="lg:col-span-3">
                <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center mb-5`}>
                  <Icon className={`w-7 h-7 ${colors.text}`} />
                </div>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-encre leading-tight mb-4">
                  {demarcheData.titre}
                </h1>
                <p className="text-lg text-encre/60 leading-relaxed">
                  {demarcheData.description}
                </p>

                {/* Trust pills */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
                    <ShieldCheck size={14} /> Service agree ANTS
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">
                    <Lock size={14} /> Paiement securise
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-medium">
                    <Clock size={14} /> Traitement sous 24h
                  </span>
                </div>
              </div>

              {/* Right col (2/5) - Pricing card */}
              <div className="lg:col-span-2">
                <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-[#1B2A4A] p-5 text-white">
                    <p className="text-white/60 text-sm">A partir de</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{demarcheData.prix_base}</span>
                      <span className="text-lg text-white/60">EUR</span>
                    </div>
                    {demarcheData.require_carte_grise_price && (
                      <p className="text-amber-300 text-sm mt-1">+ taxe regionale selon departement</p>
                    )}
                  </div>
                  <div className="p-5 space-y-4">
                    {demarcheData.require_carte_grise_price ? (
                      <button
                        onClick={() => navigate("/simulateur")}
                        className="w-full h-14 bg-bleu-france hover:bg-bleu-france/90 text-white font-semibold rounded-xl text-lg transition flex items-center justify-center gap-2"
                      >
                        Calculer mon prix <ArrowRight size={18} />
                      </button>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium text-encre/70 mb-1.5 block">
                            Immatriculation du vehicule
                          </label>
                          <Input
                            placeholder="AA-123-AA"
                            value={plaque}
                            onChange={(e) => setPlaque(e.target.value.toUpperCase())}
                            className="h-12 text-center text-lg font-mono tracking-wider border-gray-300 rounded-xl"
                          />
                        </div>
                        <button
                          onClick={handleCommencer}
                          disabled={submitting}
                          className="w-full h-14 bg-bleu-france hover:bg-bleu-france/90 text-white font-semibold rounded-xl text-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              Commencer <ArrowRight size={18} />
                            </>
                          )}
                        </button>
                      </>
                    )}
                    <div className="flex items-center justify-center gap-4 text-xs text-encre/40 pt-2">
                      <span className="flex items-center gap-1"><Lock size={12} /> SSL securise</span>
                      <span className="flex items-center gap-1"><ShieldCheck size={12} /> Agree ANTS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process steps */}
        <section className="px-4 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-encre mb-10 text-center">Comment ca marche</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {config.steps.map((step, i) => (
                <div key={i} className="relative">
                  <div className="w-10 h-10 rounded-full bg-bleu-france text-white flex items-center justify-center font-bold text-sm mb-4">
                    {i + 1}
                  </div>
                  <p className="text-sm text-encre/80 leading-relaxed">{step}</p>
                  {i < config.steps.length - 1 && (
                    <div className="hidden lg:block absolute top-5 left-12 w-[calc(100%-48px)] h-px bg-encre/10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Documents section */}
        <section className="px-4 py-16 bg-[#F8F9FA]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-encre mb-8">Documents necessaires</h2>
            {requiredDocs.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {requiredDocs.map((doc, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={16} className="text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-encre text-sm">{doc.nom_document}</p>
                      {doc.description && (
                        <p className="text-xs text-encre/50 mt-0.5">{doc.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-encre/50">
                Les documents requis seront precises lors de votre demarche.
              </p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DemarcheParticulier;
