import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, FileText, DollarSign, Mail, Calculator, ShoppingCart, UserCog, Wrench, Bell, AlertCircle, RefreshCw, Loader2, Euro, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RevenueStats from "@/components/admin/RevenueStats";
import AnnouncementManager from "@/components/admin/AnnouncementManager";
import { siteConfig } from "@/config/site.config";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [regeneratingFactures, setRegeneratingFactures] = useState(false);
  const [stats, setStats] = useState({
    totalGarages: 0,
    totalDemarches: 0,
    demarchesATraiter: 0,
    demarchesNonVues: 0,
    totalPaiements: 0,
    garagesAVerifier: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkAdminAndLoadData();
    }
  }, [user]);

  const checkAdminAndLoadData = async () => {
    if (!user) return;

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAdminRole = roles?.some(r => r.role === 'admin');

    if (!hasAdminRole) {
      navigate("/dashboard");
      return;
    }

    setIsAdmin(true);

    const { data: garages } = await supabase
      .from('garages')
      .select('id, verification_requested_at, is_verified, verification_admin_viewed');

    const { data: demarches } = await supabase
      .from('demarches')
      .select('status, montant_ttc, is_draft, paye, is_free_token, admin_viewed');

    const { data: paiementsWithDemarches } = await supabase
      .from('paiements')
      .select(`
        montant,
        status,
        demarches!inner(
          paid_with_tokens,
          is_free_token,
          frais_dossier,
          type
        )
      `);

    const { data: tokenPurchases } = await supabase
      .from('token_purchases')
      .select('amount');

    const demarchesATraiter = demarches?.filter(d =>
      d.is_draft === false && (d.paye === true || d.is_free_token === true) && d.status !== 'finalise' && d.status !== 'refuse'
    ) || [];

    const demarchesNonVues = demarchesATraiter.filter(d => !d.admin_viewed);

    const garagesAVerifier = garages?.filter(g =>
      g.verification_requested_at && !g.is_verified && !g.verification_admin_viewed
    ) || [];

    const paiementsTotal = paiementsWithDemarches?.filter(p =>
      p.status === 'valide' &&
      !p.demarches?.paid_with_tokens &&
      !p.demarches?.is_free_token
    ).reduce((sum, p) => {
      if (p.demarches?.type === 'CG' || p.demarches?.type === 'CG_DA' || p.demarches?.type === 'CG_IMPORT') {
        return sum + Number(p.demarches.frais_dossier || 20);
      }
      return sum + Number(p.montant);
    }, 0) || 0;

    const creditsTotal = tokenPurchases?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    setStats({
      totalGarages: garages?.length || 0,
      totalDemarches: demarches?.length || 0,
      demarchesATraiter: demarchesATraiter.length,
      demarchesNonVues: demarchesNonVues.length,
      totalPaiements: paiementsTotal + creditsTotal,
      garagesAVerifier: garagesAVerifier.length
    });

    setLoading(false);
  };

  const handleRegenerateAllFactures = async () => {
    setRegeneratingFactures(true);
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-all-factures', {});

      if (error) throw error;

      toast({
        title: "Succes",
        description: data?.message || "Toutes les factures ont ete regenerees",
      });
    } catch (error: any) {
      console.error('Error regenerating factures:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de regenerer les factures",
        variant: "destructive"
      });
    } finally {
      setRegeneratingFactures(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const navItems = [
    { label: "Toutes les demarches", icon: FileText, path: "/admin/demarches", badge: stats.demarchesNonVues > 0 ? stats.demarchesNonVues : undefined, badgeColor: "bg-red-100 text-red-700" },
    { label: "Gerer les garages", icon: Building2, path: "/admin/manage-garages", badge: stats.garagesAVerifier > 0 ? stats.garagesAVerifier : undefined, badgeColor: "bg-orange-100 text-orange-700" },
    { label: "Gestion des comptes", icon: Building2, path: "/admin/manage-accounts" },
    { label: "Notifications", icon: Bell, path: "/admin/notifications" },
    { label: "Historique paiements", icon: DollarSign, path: "/admin/historique-paiements" },
    { label: "Achats jetons", icon: Euro, path: "/admin/token-purchases" },
    { label: "Administrateurs", icon: UserCog, path: "/admin/users" },
    { label: "Templates Email", icon: Mail, path: "/admin/email-templates" },
    { label: "Test Email", icon: Mail, path: "/admin/test-email" },
  ];

  const particulierItems = [
    { label: "Simulateur Particulier", icon: Calculator, path: "/admin/pricing-config" },
    { label: "Commandes Particuliers", icon: ShoppingCart, path: "/admin/guest-orders" },
    { label: "Actions rapides Particuliers", icon: ClipboardList, path: "/admin/guest-actions" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 rounded-md hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au tableau de bord
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">Administration</h1>
          <p className="text-gray-500">
            Vue d'ensemble de la plateforme {siteConfig.siteName}
          </p>
        </div>

        {/* Alerte demarches a traiter */}
        {stats.demarchesNonVues > 0 && (
          <div
            className="mb-6 border-l-4 border-red-500 bg-white p-5 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate("/admin/demarches")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">
                    {stats.demarchesNonVues} nouvelle{stats.demarchesNonVues > 1 ? 's' : ''} demarche{stats.demarchesNonVues > 1 ? 's' : ''} a traiter !
                  </p>
                  <p className="text-sm text-red-600">
                    Cliquez pour voir les demarches en attente
                  </p>
                </div>
              </div>
              <Button className="rounded-md bg-red-600 hover:bg-red-700 text-white shadow-sm">
                <Bell className="h-4 w-4 mr-2" />
                Voir maintenant
              </Button>
            </div>
          </div>
        )}

        {/* Alerte garages a verifier */}
        {stats.garagesAVerifier > 0 && (
          <div
            className="mb-6 border-l-4 border-amber-500 bg-white p-5 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate("/admin/manage-garages")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-800">
                    {stats.garagesAVerifier} garage{stats.garagesAVerifier > 1 ? 's' : ''} a verifier !
                  </p>
                  <p className="text-sm text-amber-600">
                    Cliquez pour verifier les documents soumis
                  </p>
                </div>
              </div>
              <Button className="rounded-md bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
                <Bell className="h-4 w-4 mr-2" />
                Verifier
              </Button>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white border border-gray-200 border-l-4 border-l-green-500 rounded-md p-5">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Revenus</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPaiements.toFixed(2)} &euro;</p>
            <p className="text-xs text-gray-500 mt-1">Revenu total plateforme</p>
          </div>

          <div
            className="bg-white border border-gray-200 border-l-4 border-l-blue-500 rounded-md p-5 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate("/admin/demarches")}
          >
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-2">
              A traiter
              {stats.demarchesNonVues > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                  {stats.demarchesNonVues}
                </span>
              )}
            </p>
            <p className="text-2xl font-bold text-gray-900">{stats.demarchesATraiter}</p>
            <p className="text-xs text-gray-500 mt-1">Demarches payees/jeton</p>
          </div>

          <div className="bg-white border border-gray-200 border-l-4 border-l-purple-500 rounded-md p-5">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Garages</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalGarages}</p>
            <p className="text-xs text-gray-500 mt-1">Entreprises inscrites</p>
          </div>

          <div className="bg-white border border-gray-200 border-l-4 border-l-amber-500 rounded-md p-5">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Total demarches</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalDemarches}</p>
            <p className="text-xs text-gray-500 mt-1">Toutes demarches</p>
          </div>
        </div>

        {/* Revenue Stats - Link to full page */}
        <div
          className="mb-8 bg-white border border-gray-200 rounded-md p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => navigate("/admin/revenus")}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-semibold text-gray-900">Revenus</h2>
              <p className="text-sm text-gray-500">Revenu total: {stats.totalPaiements.toFixed(2)} &euro;</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-md">
              Voir les statistiques detaillees &rarr;
            </Button>
          </div>
        </div>

        {/* Section Particuliers */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Espace Particuliers</p>
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-md">
            {particulierItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <item.icon className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Annonces generales */}
        <div className="mb-8">
          <AnnouncementManager />
        </div>

        {/* Section Garages */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Espace Garages</p>
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-md">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                {item.badge && (
                  <span className={`inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-xs font-bold ${item.badgeColor || 'bg-red-100 text-red-700'}`}>
                    {item.badge}
                  </span>
                )}
                <item.icon className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </button>
            ))}
            <button
              onClick={handleRegenerateAllFactures}
              disabled={regeneratingFactures}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
            >
              {regeneratingFactures ? (
                <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {regeneratingFactures ? "Regeneration..." : "Regenerer factures"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
