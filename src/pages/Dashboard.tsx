import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, LogOut, Settings, UserCircle, Clock, CheckCircle, CheckCircle2, AlertCircle, XCircle, Receipt, Gift, Coins, Menu, X, HelpCircle, LayoutDashboard, ChevronRight, Building2, Building, Phone, Mail, MapPin, BadgeCheck, AlertTriangle, Hash, Shield } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { siteConfig } from "@/config/site.config";
import { motion } from "framer-motion";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon apres-midi";
  return "Bonsoir";
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const pastelColors = [
  { bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-500", ring: "ring-blue-200" },
  { bg: "bg-teal-50", text: "text-teal-700", icon: "text-teal-500", ring: "ring-teal-200" },
  { bg: "bg-amber-50", text: "text-amber-700", icon: "text-amber-500", ring: "ring-amber-200" },
  { bg: "bg-purple-50", text: "text-purple-700", icon: "text-purple-500", ring: "ring-purple-200" },
];

export default function Dashboard() {
  const {
    user,
    signOut,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const [garage, setGarage] = useState<any>(null);
  const [stats, setStats] = useState({
    totalDemarches: 0,
    enAttente: 0,
    validees: 0,
    attentePaiementClient: 0
  });
  const [recentDemarches, setRecentDemarches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionsRapides, setActionsRapides] = useState<any[]>([]);
  const [missingDocsCount, setMissingDocsCount] = useState(3);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    setIsAdmin(!!roleData);

    const { data: actionsData } = await supabase
      .from('actions_rapides')
      .select('*')
      .eq('actif', true)
      .order('ordre');
    if (actionsData) {
      setActionsRapides(actionsData);
    }

    const { data: garageData } = await supabase
      .from('garages')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!roleData && !garageData) {
      navigate("/complete-profile");
      return;
    }

    if (garageData) {
      setGarage(garageData);
      const { data: demarches } = await supabase
        .from('demarches')
        .select('*')
        .eq('garage_id', garageData.id)
        .eq('paye', true)
        .order('created_at', { ascending: false });

      // Also count demarches awaiting client payment (including non-paid ones)
      const { data: attentePaiement } = await supabase
        .from('demarches')
        .select('id')
        .eq('garage_id', garageData.id)
        .eq('status', 'attente_paiement_client');

      setStats({
        totalDemarches: demarches?.length || 0,
        enAttente: demarches?.filter(d => d.status === 'en_attente' || d.status === 'paye').length || 0,
        validees: demarches?.filter(d => d.status === 'valide' || d.status === 'finalise').length || 0,
        attentePaiementClient: attentePaiement?.length || 0
      });
      setRecentDemarches(demarches?.slice(0, 5) || []);

      if (!garageData.is_verified) {
        const { data: verificationDocs } = await supabase
          .from('verification_documents')
          .select('document_type')
          .eq('garage_id', garageData.id)
          .in('status', ['pending', 'approved']);

        const uploadedTypes = new Set(verificationDocs?.map(d => d.document_type) || []);
        const requiredDocs = ['kbis', 'carte_identite', 'mandat'];
        const missing = requiredDocs.filter(doc => !uploadedTypes.has(doc)).length;
        setMissingDocsCount(missing);
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
    en_saisie: { label: "En saisie", color: "text-gray-500", bgColor: "bg-gray-100", icon: UserCircle },
    en_attente: { label: "En attente", color: "text-amber-600", bgColor: "bg-amber-50", icon: Clock },
    paye: { label: "Payee", color: "text-blue-600", bgColor: "bg-blue-50", icon: CheckCircle },
    valide: { label: "Validee", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle },
    finalise: { label: "Finalisee", color: "text-teal-600", bgColor: "bg-teal-50", icon: CheckCircle },
    attente_paiement_client: { label: "Attente paiement", color: "text-amber-600", bgColor: "bg-amber-50", icon: Clock },
  };

  const refusees = (stats.totalDemarches - stats.enAttente - stats.validees);

  const tokenBalance = garage?.token_balance || 0;
  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-[#1B2A4A]">{siteConfig.siteName}</span>
            <span className="hidden sm:inline text-xs bg-bleu-france/10 text-bleu-france px-2 py-0.5 rounded-full font-medium">Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Mes demarches', path: '/mes-demarches' },
              { label: 'Factures', path: '/mes-factures' },
              { label: 'Support', path: '/support' },
            ].map(link => (
              <button key={link.path} onClick={() => navigate(link.path)} className="px-3 py-2 text-sm text-encre/60 hover:text-encre hover:bg-gray-50 rounded-lg transition">
                {link.label}
              </button>
            ))}
            {isAdmin && (
              <button onClick={() => navigate('/dashboard')} className="px-3 py-2 text-sm text-rouge-france hover:bg-rouge-france/5 rounded-lg transition">
                Admin
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {garage && <NotificationBell garageId={garage.id} />}

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="rounded-full min-h-[48px] min-w-[48px]">
                  <Menu className="h-5 w-5 text-gray-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-[#F8F9FA]">
                <SheetHeader>
                  <SheetTitle className="text-[#1B2A4A]">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  <Button
                    className="w-full justify-start rounded-2xl bg-[#1B2A4A] text-white min-h-[48px]"
                    onClick={() => { setMobileMenuOpen(false); }}
                  >
                    <LayoutDashboard className="mr-3 h-5 w-5" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full justify-start rounded-2xl text-gray-700 min-h-[48px]" onClick={() => { setMobileMenuOpen(false); navigate("/mes-demarches"); }}>
                    <FileText className="mr-3 h-5 w-5" />
                    Mes demarches
                  </Button>
                  <Button variant="ghost" className="w-full justify-start rounded-2xl text-gray-700 min-h-[48px]" onClick={() => { setMobileMenuOpen(false); navigate("/mes-factures"); }}>
                    <Receipt className="mr-3 h-5 w-5" />
                    Factures
                  </Button>
                  <Button variant="ghost" className="w-full justify-start rounded-2xl text-gray-700 min-h-[48px]" onClick={() => { setMobileMenuOpen(false); navigate("/support"); }}>
                    <HelpCircle className="mr-3 h-5 w-5" />
                    Support
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" className="w-full justify-start rounded-2xl text-gray-700 min-h-[48px]" onClick={() => { setMobileMenuOpen(false); navigate("/dashboard"); }}>
                      <Settings className="mr-3 h-5 w-5" />
                      Administration
                    </Button>
                  )}
                  <Button variant="ghost" className="w-full justify-start rounded-2xl text-gray-700 min-h-[48px]" onClick={() => { setMobileMenuOpen(false); navigate("/garage-settings"); }}>
                    <UserCircle className="mr-3 h-5 w-5" />
                    Parametres
                  </Button>
                  <div className="border-t border-gray-200 my-3" />
                  <Button variant="ghost" className="w-full justify-start rounded-2xl text-red-500 hover:bg-red-50 min-h-[48px]" onClick={() => { setMobileMenuOpen(false); handleLogout(); }}>
                    <LogOut className="mr-3 h-5 w-5" />
                    Deconnexion
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <button onClick={handleLogout} className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-encre/40 hover:text-encre hover:bg-gray-50 rounded-lg transition">
              <LogOut className="h-4 w-4" />
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Announcements */}
        <AnnouncementBanner />

        {/* ROW 1: Welcome hero + Token balance */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Welcome hero (3 cols) */}
          <div className="lg:col-span-3 bg-gradient-to-br from-[#1B2A4A] to-[#2D4A7A] rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/50 text-sm">{greeting}</p>
                  <h1 className="text-2xl md:text-3xl font-bold mt-1">{garage?.raison_sociale || 'Votre espace'}</h1>
                  <p className="text-white/40 mt-1 text-sm">Votre espace professionnel {siteConfig.siteName}</p>
                </div>
                {garage?.is_verified && (
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                    <BadgeCheck size={14} /> Verifie
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {[
                  { to: '/mes-demarches', label: 'Mes demarches' },
                  { to: '/mes-factures', label: 'Factures' },
                  { to: '/garage-settings', label: 'Parametres' },
                ].map(l => (
                  <button key={l.to} onClick={() => navigate(l.to)} className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition">
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Token balance card (1 col) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs text-encre/40 font-medium uppercase tracking-wider">Solde</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-bold text-encre">{tokenBalance}</span>
                <span className="text-lg text-encre/30">EUR</span>
              </div>
            </div>
            <button onClick={() => navigate('/acheter-jetons')} className="mt-5 w-full h-11 bg-[#1B2A4A] hover:bg-[#2D4A7A] text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
              <Plus size={16} /> Recharger
            </button>
          </div>
        </motion.div>

        {/* ROW 2: Alerts */}
        {garage && !garage.is_verified && missingDocsCount > 0 && (
          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-encre">Completez votre verification</p>
                  <p className="text-sm text-encre/50">Envoyez vos documents pour activer toutes les fonctionnalites ({missingDocsCount} document{missingDocsCount > 1 ? "s" : ""} manquant{missingDocsCount > 1 ? "s" : ""})</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/garage-settings?tab=verification")}
                className="border border-amber-300 text-amber-700 hover:bg-amber-100 rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition"
              >
                Envoyer mes documents
              </button>
            </div>
          </motion.div>
        )}

        {garage?.free_token_available && (
          <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-xl">
                <Gift className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-encre">Votre premiere demarche est offerte</p>
                <p className="text-sm text-encre/50">Beneficiez d'une Declaration de cession ou d'achat gratuite</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ROW 3: Stats cards */}
        <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total demarches', value: stats.totalDemarches, icon: FileText, colorBg: 'bg-blue-50', colorIcon: 'text-blue-500' },
            { label: 'En attente', value: stats.enAttente, icon: Clock, colorBg: 'bg-amber-50', colorIcon: 'text-amber-500' },
            { label: 'Validees', value: stats.validees, icon: CheckCircle2, colorBg: 'bg-green-50', colorIcon: 'text-green-500' },
            { label: 'Refusees', value: refusees > 0 ? refusees : 0, icon: XCircle, colorBg: 'bg-red-50', colorIcon: 'text-red-500' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-encre/40 font-medium uppercase tracking-wider">{s.label}</p>
                  <div className={`w-8 h-8 rounded-lg ${s.colorBg} flex items-center justify-center`}>
                    <Icon size={16} className={s.colorIcon} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-encre">{s.value}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Attente paiement client badge */}
        {stats.attentePaiementClient > 0 && (
          <motion.div initial="hidden" animate="visible" custom={2.5} variants={fadeUp}>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-encre text-sm">
                    {stats.attentePaiementClient} démarche{stats.attentePaiementClient > 1 ? 's' : ''} en attente de paiement client
                  </p>
                  <p className="text-xs text-encre/50">Le client n'a pas encore réglé le montant de la carte grise</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/mes-demarches?filter=attente_paiement_client')}
                className="border border-amber-300 text-amber-700 hover:bg-amber-100 rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition"
              >
                Voir
              </button>
            </div>
          </motion.div>
        )}

        {/* ROW 4: Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
              <div className="bg-white rounded-2xl border border-gray-100">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-encre">Actions rapides</h2>
                  <button onClick={() => navigate('/nouvelle-demarche')} className="text-sm text-bleu-france hover:underline">Voir tout &rarr;</button>
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {actionsRapides.map((action, index) => {
                    const isFreeTokenEligible = garage?.free_token_available && (action.code === 'DA' || action.code === 'DC');
                    const palette = pastelColors[index % pastelColors.length];
                    const priceDisplay = action.code === 'CG' ? `${action.prix}\u20AC + CG` : `${action.prix}\u20AC`;

                    return (
                      <button
                        key={action.id}
                        onClick={() => navigate(`/nouvelle-demarche?type=${action.code}`)}
                        className="text-left p-4 rounded-xl border border-gray-100 hover:border-[#1B2A4A]/20 hover:bg-[#1B2A4A]/5 transition group"
                      >
                        <div className={`w-10 h-10 rounded-lg ${palette.bg} flex items-center justify-center mb-3`}>
                          <FileText className={`w-5 h-5 ${palette.icon}`} />
                        </div>
                        <p className="font-medium text-encre text-sm">{action.titre}</p>
                        <p className="text-xs text-encre/40 mt-0.5">
                          {isFreeTokenEligible ? "Gratuit" : priceDisplay}
                        </p>
                        {isFreeTokenEligible && (
                          <span className="inline-block mt-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">OFFERT</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Recent Demarches */}
            <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
              <div className="bg-white rounded-2xl border border-gray-100">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-encre">Demarches recentes</h2>
                  <button onClick={() => navigate('/mes-demarches')} className="text-sm text-bleu-france hover:underline">Tout voir &rarr;</button>
                </div>
                {recentDemarches.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {recentDemarches.map((demarche) => {
                      const config = statusConfig[demarche.status] || statusConfig.en_attente;
                      const StatusIcon = config.icon;

                      return (
                        <Link
                          key={demarche.id}
                          to={`/demarche/${demarche.id}`}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                              <StatusIcon className={`w-4 h-4 ${config.color}`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-encre">
                                {demarche.type === 'CG'
                                  ? 'Carte Grise'
                                  : demarche.type === 'DA'
                                  ? "Declaration d'Achat"
                                  : demarche.type === 'DC'
                                  ? 'Declaration de Cession'
                                  : demarche.type}
                              </p>
                              <p className="text-xs text-encre/40">
                                {demarche.immatriculation} · {new Date(demarche.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${config.bgColor} ${config.color}`}>
                            {config.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-encre/40">Aucune demarche recente</p>
                    <button onClick={() => navigate("/nouvelle-demarche")} className="mt-3 border border-gray-200 text-encre text-sm px-4 py-2 rounded-xl hover:bg-gray-50 transition">
                      Creer ma premiere demarche
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Garage info card */}
            {garage && (
              <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="text-xs text-encre/40 font-medium uppercase tracking-wider mb-4">Votre garage</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-encre/30 flex-shrink-0" />
                      <span className="text-encre/70">{garage.raison_sociale}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-encre/30 flex-shrink-0" />
                      <span className="text-encre/70">SIRET: {garage.siret}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-encre/30 flex-shrink-0" />
                      <span className="text-encre/70 truncate">{garage.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-encre/30 flex-shrink-0" />
                      <span className="text-encre/70">{garage.telephone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-encre/30 flex-shrink-0" />
                      <span className="text-encre/70">{garage.adresse}, {garage.code_postal} {garage.ville}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/garage-settings")}
                    className="w-full mt-4 h-10 border border-gray-200 text-encre/60 hover:text-encre hover:bg-gray-50 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" /> Modifier
                  </button>
                </div>
              </motion.div>
            )}

            {/* Quick links */}
            <motion.div initial="hidden" animate="visible" custom={6} variants={fadeUp}>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-xs text-encre/40 font-medium uppercase tracking-wider mb-4">Liens rapides</h3>
                <div className="space-y-1">
                  <Link to="/support" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-sm text-encre/70 transition">
                    <HelpCircle className="w-4 h-4" /> Support
                  </Link>
                  <Link to="/mes-factures" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-sm text-encre/70 transition">
                    <Receipt className="w-4 h-4" /> Mes factures
                  </Link>
                  {isAdmin && (
                    <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-sm text-encre/70 transition">
                      <Shield className="w-4 h-4" /> Administration
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
