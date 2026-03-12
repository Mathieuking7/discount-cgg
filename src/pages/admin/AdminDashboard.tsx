import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  ClipboardList,
  PlusCircle,
  Link,
  CreditCard,
  TrendingUp,
  Settings,
  Loader2,
  Clock,
  ChevronRight,
  Home,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { siteConfig } from "@/config/site.config";

interface QuickStat {
  label: string;
  value: string | number;
  sublabel: string;
  color: string;
}

interface RecentOrder {
  id: string;
  type: string;
  status: string;
  created_at: string;
  nom?: string;
  prenom?: string;
}

const STATUS_COLORS: Record<string, string> = {
  en_attente: "bg-amber-100 text-amber-800",
  paye: "bg-emerald-100 text-emerald-800",
  payee: "bg-emerald-100 text-emerald-800",
  en_cours: "bg-blue-100 text-blue-800",
  en_traitement: "bg-blue-100 text-blue-800",
  documents_valides: "bg-cyan-100 text-cyan-800",
  document_refuse: "bg-orange-100 text-orange-800",
  documents_refuses: "bg-orange-100 text-orange-800",
  soumis_ants: "bg-indigo-100 text-indigo-800",
  cpi_disponible: "bg-teal-100 text-teal-800",
  valide: "bg-green-100 text-green-800",
  finalise: "bg-green-100 text-green-800",
  termine: "bg-green-100 text-green-800",
  terminee: "bg-green-100 text-green-800",
  annule: "bg-red-100 text-red-800",
  annulee: "bg-red-100 text-red-800",
  refuse: "bg-red-100 text-red-800",
  attente_paiement: "bg-amber-100 text-amber-800",
  attente_paiement_client: "bg-amber-100 text-amber-800",
  expedition: "bg-purple-100 text-purple-800",
  livree: "bg-green-100 text-green-800",
};

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  paye: "Paye",
  payee: "Payee",
  en_cours: "En cours",
  en_traitement: "En traitement",
  documents_valides: "Documents valides",
  document_refuse: "Document refuse",
  documents_refuses: "Documents refuses",
  soumis_ants: "Soumis ANTS",
  cpi_disponible: "CPI disponible",
  valide: "Valide",
  finalise: "Finalise",
  termine: "Termine",
  terminee: "Terminee",
  annule: "Annule",
  annulee: "Annulee",
  refuse: "Refuse",
  attente_paiement: "Attente paiement",
  attente_paiement_client: "Attente paiement client",
  expedition: "Expedition",
  livree: "Livree",
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenuDuJour: 0,
    commandesEnCours: 0,
    commandesATraiter: 0,
    liensActifs: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

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
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasAdminRole = roles?.some((r) => r.role === "admin");

    if (!hasAdminRole) {
      navigate("/nouvelle-demarche");
      return;
    }

    setIsAdmin(true);

    // Fetch stats in parallel
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const [
      { data: todayPaiements },
      { data: guestOrders },
      { data: paymentLinks },
      { data: recent },
    ] = await Promise.all([
      supabase
        .from("paiements")
        .select("montant, status, created_at")
        .eq("status", "valide")
        .gte("created_at", todayISO),
      supabase
        .from("guest_orders")
        .select("id, status"),
      supabase
        .from("payment_links")
        .select("id, status")
        .eq("status", "active"),
      supabase
        .from("guest_orders")
        .select("id, demarche_type, status, created_at, nom, prenom")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const revenuDuJour =
      todayPaiements?.reduce((sum, p) => sum + Number(p.montant), 0) || 0;
    const commandesEnCours =
      guestOrders?.filter(
        (o) => o.status !== "finalise" && o.status !== "refuse"
      ).length || 0;
    const commandesATraiter =
      guestOrders?.filter((o) => o.status === "en_attente").length || 0;
    const liensActifs = paymentLinks?.length || 0;

    setStats({ revenuDuJour, commandesEnCours, commandesATraiter, liensActifs });
    setRecentOrders(
      (recent || []).map((r) => ({
        id: r.id,
        type: r.demarche_type || "—",
        status: r.status,
        created_at: r.created_at,
        nom: r.nom,
        prenom: r.prenom,
      }))
    );

    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#1B2A4A] mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const quickStats: QuickStat[] = [
    {
      label: "Revenu du jour",
      value: `${stats.revenuDuJour.toFixed(2)} \u20AC`,
      sublabel: "Paiements valides aujourd'hui",
      color: "border-l-emerald-500",
    },
    {
      label: "Commandes en cours",
      value: stats.commandesEnCours,
      sublabel: "Non finalisees",
      color: "border-l-blue-500",
    },
    {
      label: "A traiter",
      value: stats.commandesATraiter,
      sublabel: "En attente de traitement",
      color: "border-l-amber-500",
    },
    {
      label: "Liens actifs",
      value: stats.liensActifs,
      sublabel: "Liens de paiement actifs",
      color: "border-l-purple-500",
    },
  ];

  const quickActions = [
    {
      icon: ClipboardList,
      title: "Demarches en cours",
      description: "Voir toutes les demarches en cours",
      path: "/dashboard/guest-orders",
      badge: stats.commandesATraiter > 0 ? stats.commandesATraiter : undefined,
    },
    {
      icon: PlusCircle,
      title: "Creer une demarche avec lien de paiement",
      description: "Generez un lien pour que votre client complete sa demarche",
      path: "/dashboard/create-demarche",
    },
    {
      icon: Link,
      title: "Demander un paiement manuellement",
      description: "Lien simple, QR code, envoi par mail",
      path: "/dashboard/payment-links",
    },
    {
      icon: CreditCard,
      title: "Mes paiements",
      description: "Voir tous les achats et paiements",
      path: "/dashboard/historique-paiements",
    },
    {
      icon: TrendingUp,
      title: "Revenus",
      description: "Tableau de bord des revenus",
      path: "/dashboard/revenus",
    },
    {
      icon: Settings,
      title: "Configuration",
      description: "Prix, demarches, documents requis",
      path: "/dashboard/pricing-config",
    },
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">
              Tableau de bord
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {siteConfig.siteName} — Administration
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="text-gray-600"
            >
              <Home className="mr-1.5 h-4 w-4" />
              Site
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="mr-1.5 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className={`bg-white rounded-lg border border-gray-200 border-l-4 ${stat.color} p-4`}
            >
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-[#1B2A4A] mt-1">
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{stat.sublabel}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="group relative bg-white rounded-lg border border-gray-200 p-4 sm:p-5 text-left hover:border-[#1B2A4A]/30 hover:shadow-md transition-all duration-200 min-h-[48px]"
              >
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-[#1B2A4A]/5 flex items-center justify-center group-hover:bg-[#1B2A4A]/10 transition-colors">
                    <action.icon className="h-5 w-5 text-[#1B2A4A]" />
                  </div>
                  {action.badge && (
                    <Badge className="bg-amber-100 text-amber-800 border-0 text-xs font-bold">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-[#1B2A4A] mt-3 text-sm">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {action.description}
                </p>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-hover:text-[#1B2A4A]/50 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-[#1B2A4A]">
                Activite recente
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/guest-orders")}
              className="text-xs text-gray-500 hover:text-[#1B2A4A]"
            >
              Voir tout
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              Aucune commande recente
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/dashboard/guest-orders`)}
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-5 py-3 min-h-[48px] hover:bg-gray-50 transition-colors text-left gap-1 sm:gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-sm">
                      <span className="font-medium text-[#1B2A4A]">
                        {order.prenom} {order.nom}
                      </span>
                      <span className="text-gray-400 ml-2 text-xs">
                        {order.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-400">
                      {formatDate(order.created_at)}
                    </span>
                    <Badge
                      className={`text-xs border-0 ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
