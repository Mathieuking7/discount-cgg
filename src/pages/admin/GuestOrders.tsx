import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Eye, Package, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface GuestOrder {
  id: string;
  tracking_number: string;
  immatriculation: string;
  nom: string;
  prenom: string;
  email: string;
  montant_ttc: number;
  status: string;
  paye: boolean;
  documents_complets: boolean;
  created_at: string;
  demarche_type?: string;
}

type StatusFilter = "all" | "en_attente" | "en_cours" | "terminee" | "annulee";

const statusConfig: Record<string, { label: string; bgClass: string }> = {
  en_attente: { label: "En attente", bgClass: "bg-amber-100 text-amber-800" },
  en_cours: { label: "En cours", bgClass: "bg-blue-100 text-blue-800" },
  terminee: { label: "Terminee", bgClass: "bg-green-100 text-green-800" },
  annulee: { label: "Annulee", bgClass: "bg-red-100 text-red-800" },
  // legacy statuses mapped
  valide: { label: "Valide", bgClass: "bg-blue-100 text-blue-800" },
  finalise: { label: "Finalise", bgClass: "bg-green-100 text-green-800" },
  refuse: { label: "Refuse", bgClass: "bg-red-100 text-red-800" },
};

const demarcheColors: Record<string, string> = {
  DA: "bg-purple-100 text-purple-800",
  DC: "bg-indigo-100 text-indigo-800",
  CG: "bg-teal-100 text-teal-800",
  DI: "bg-sky-100 text-sky-800",
  CT: "bg-rose-100 text-rose-800",
};

const filterTabs: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "en_attente", label: "En attente" },
  { key: "en_cours", label: "En cours" },
  { key: "terminee", label: "Terminees" },
  { key: "annulee", label: "Annulees" },
];

export default function GuestOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<GuestOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");

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

    if (!roles?.some((r) => r.role === "admin")) {
      navigate("/dashboard");
      return;
    }
    await loadOrders();
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("guest_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
    toast({ title: "Liste actualisee" });
  };

  // Counts per status
  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: orders.length,
      en_attente: 0,
      en_cours: 0,
      terminee: 0,
      annulee: 0,
    };
    orders.forEach((o) => {
      if (o.status in counts) {
        counts[o.status as StatusFilter]++;
      }
    });
    return counts;
  }, [orders]);

  // Filtered + searched orders
  const filteredOrders = useMemo(() => {
    let result = orders;

    if (activeFilter !== "all") {
      result = result.filter((o) => o.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.nom.toLowerCase().includes(q) ||
          o.prenom.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.immatriculation.toLowerCase().includes(q) ||
          o.tracking_number.toLowerCase().includes(q)
      );
    }

    return result;
  }, [orders, activeFilter, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="rounded-full hover:bg-white/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au dashboard
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-full"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Rafraichir
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Demarches en cours</h1>
              <p className="text-sm text-gray-500">
                {orders.length} demarche{orders.length > 1 ? "s" : ""} au total
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#0f1b3d] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold ${
                      isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {statusCounts[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email ou immatriculation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-gray-200"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#0f1b3d] hover:bg-[#0f1b3d]">
                  <TableHead className="text-white font-semibold text-xs uppercase tracking-wider">Date</TableHead>
                  <TableHead className="text-white font-semibold text-xs uppercase tracking-wider">Client</TableHead>
                  <TableHead className="text-white font-semibold text-xs uppercase tracking-wider">Type</TableHead>
                  <TableHead className="text-white font-semibold text-xs uppercase tracking-wider">Immatriculation</TableHead>
                  <TableHead className="text-white font-semibold text-xs uppercase tracking-wider">Montant</TableHead>
                  <TableHead className="text-white font-semibold text-xs uppercase tracking-wider">Statut</TableHead>
                  <TableHead className="text-white font-semibold text-xs uppercase tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-400 py-12">
                      Aucune demarche trouvee
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order, index) => {
                    const status = statusConfig[order.status] || {
                      label: order.status,
                      bgClass: "bg-gray-100 text-gray-700",
                    };
                    const demarcheLabel = order.demarche_type || "CG";
                    const demarcheColor = demarcheColors[demarcheLabel] || "bg-gray-100 text-gray-700";

                    return (
                      <TableRow
                        key={order.id}
                        className={`border-gray-50 ${index % 2 === 1 ? "bg-gray-50/60" : ""} hover:bg-orange-50/40 transition-colors`}
                      >
                        <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">
                              {order.prenom} {order.nom}
                            </p>
                            <p className="text-xs text-gray-400">{order.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${demarcheColor}`}
                          >
                            {demarcheLabel}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-gray-600">
                          {order.immatriculation}
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900 whitespace-nowrap">
                          {order.montant_ttc.toFixed(2)} &euro;
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.bgClass}`}
                          >
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dashboard/guest-order/${order.id}`)}
                            className="rounded-full text-xs"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Result count */}
          {searchQuery && (
            <p className="text-xs text-gray-400 mt-3">
              {filteredOrders.length} resultat{filteredOrders.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
