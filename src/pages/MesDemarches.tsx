import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  Search,
  Gift,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/config/site.config";

const getStatusLabel = (demarche: any): string => {
  if (demarche.is_free_token && !demarche.paye) return "Offert";
  const statusLabels: Record<string, string> = {
    en_saisie: "En saisie",
    en_attente: "En attente",
    paye: "Paye",
    valide: "Valide",
    finalise: "Finalise",
    refuse: "Refuse",
  };
  return statusLabels[demarche.status] || demarche.status;
};

const statusConfig: Record<string, { bg: string; text: string; border: string; icon: any; label: string }> = {
  en_saisie: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300", icon: Edit, label: "En saisie" },
  en_attente: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-300", icon: Clock, label: "En attente" },
  paye: { bg: "bg-[#002395]/10", text: "text-[#002395]", border: "border-[#002395]/30", icon: CheckCircle, label: "Paye" },
  valide: { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-300", icon: CheckCircle, label: "Valide" },
  finalise: { bg: "bg-green-50", text: "text-green-800", border: "border-green-300", icon: CheckCircle, label: "Finalise" },
  refuse: { bg: "bg-[#ED2939]/10", text: "text-[#ED2939]", border: "border-[#ED2939]/30", icon: XCircle, label: "Refuse" },
};

const typeLabels: Record<string, string> = {
  DA: "Declaration d'achat",
  DC: "Declaration de cession",
  CG: "Carte grise",
  CG_DA: "CG + DA",
  DA_DC: "DA + DC",
  CG_IMPORT: "Import etranger",
};

function StatusBadge({ demarche }: { demarche: any }) {
  if (demarche.is_free_token && !demarche.paye) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
        <Gift className="h-3.5 w-3.5" />
        Offert
      </span>
    );
  }
  const cfg = statusConfig[demarche.status] || statusConfig.en_saisie;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

/** Returns the left-border color class for mobile rows */
function getStatusBorderColor(demarche: any): string {
  if (demarche.is_free_token && !demarche.paye) return "border-l-emerald-500";
  const map: Record<string, string> = {
    en_saisie: "border-l-gray-400",
    en_attente: "border-l-amber-500",
    paye: "border-l-[#002395]",
    valide: "border-l-teal-500",
    finalise: "border-l-green-500",
    refuse: "border-l-[#ED2939]",
  };
  return map[demarche.status] || "border-l-gray-400";
}

const filterChips = [
  { value: "all", label: "Tous" },
  { value: "en_attente", label: "En attente" },
  { value: "paye", label: "Paye" },
  { value: "valide", label: "Valide" },
  { value: "finalise", label: "Finalise" },
  { value: "refuse", label: "Refuse" },
];

export default function MesDemarches() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [garage, setGarage] = useState<any>(null);
  const [demarches, setDemarches] = useState<any[]>([]);
  const [brouillons, setBrouillons] = useState<any[]>([]);
  const [filteredDemarches, setFilteredDemarches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [showAllBrouillons, setShowAllBrouillons] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  useEffect(() => {
    let filtered = demarches;
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.numero_demarche?.toLowerCase().includes(query) ||
          d.immatriculation?.toLowerCase().includes(query) ||
          typeLabels[d.type]?.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((d) => d.type === typeFilter);
    }
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === "created_at") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortField === "montant_ttc") {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }
      return sortDirection === "asc" ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
    });
    setFilteredDemarches(filtered);
  }, [demarches, searchQuery, statusFilter, typeFilter, sortField, sortDirection]);

  const loadData = async () => {
    if (!user) return;
    const { data: garageData } = await supabase
      .from("garages")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (garageData) {
      setGarage(garageData);
      const { data: demarchesData } = await supabase
        .from("demarches")
        .select("*")
        .eq("garage_id", garageData.id)
        .or("paye.eq.true,is_free_token.eq.true")
        .order("created_at", { ascending: false });
      if (demarchesData) {
        setDemarches(demarchesData);
        setFilteredDemarches(demarchesData);
      }
      const { data: brouillonsData } = await supabase
        .from("demarches")
        .select("*")
        .eq("garage_id", garageData.id)
        .eq("is_draft", true)
        .eq("paye", false)
        .eq("is_free_token", false)
        .order("created_at", { ascending: false });
      if (brouillonsData) setBrouillons(brouillonsData);
    }
    setLoading(false);
  };

  const handleDeleteBrouillon = async (brouillonId: string) => {
    const { error } = await supabase
      .from("demarches")
      .delete()
      .eq("id", brouillonId)
      .eq("is_draft", true)
      .eq("paye", false);
    if (!error) {
      setBrouillons((prev) => prev.filter((b) => b.id !== brouillonId));
      toast({ title: "Brouillon supprime", description: "Le brouillon a ete supprime avec succes" });
    } else {
      toast({ title: "Erreur", description: "Impossible de supprimer le brouillon", variant: "destructive" });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002395] mx-auto" />
          <p className="mt-4 text-gray-500 font-sans">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1A1A1A] transition-colors mb-4 min-h-[48px] font-sans"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-[#1A1A1A] pb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-sans mb-2">Mes demarches</p>
              <h1 className="text-3xl font-serif text-[#1A1A1A]">Demarches administratives</h1>
              <p className="text-gray-500 mt-1 font-sans text-sm">Suivez l'etat de toutes vos demarches</p>
            </div>
            <Button
              onClick={() => navigate("/nouvelle-demarche")}
              className="rounded-md px-6 h-12 text-sm font-semibold bg-[#002395] hover:bg-[#001a6e] text-white transition-all font-sans min-w-[48px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle demarche
            </Button>
          </div>
        </motion.div>

        {/* Brouillons */}
        <AnimatePresence>
          {brouillons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mb-8 border-l-4 border-amber-400 bg-amber-50/40 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-amber-800 flex items-center gap-2 font-sans">
                  <Edit className="h-4 w-4" />
                  Brouillons ({brouillons.length})
                </h2>
                {brouillons.length > 2 && (
                  <button
                    onClick={() => setShowAllBrouillons(!showAllBrouillons)}
                    className="text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center gap-1 transition-colors font-sans min-h-[48px]"
                  >
                    {showAllBrouillons ? (
                      <>Masquer <ChevronUp className="h-3 w-3" /></>
                    ) : (
                      <>Tout afficher ({brouillons.length}) <ChevronDown className="h-3 w-3" /></>
                    )}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {(showAllBrouillons ? brouillons : brouillons.slice(0, 2)).map((brouillon) => (
                  <div
                    key={brouillon.id}
                    className="flex items-center justify-between p-3 bg-white border-b border-amber-200 text-sm"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300 font-sans">
                        {typeLabels[brouillon.type] || brouillon.type}
                      </span>
                      <span className="font-mono text-xs text-gray-600">{brouillon.immatriculation}</span>
                      <span className="text-xs text-gray-400 font-sans">
                        {new Date(brouillon.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/nouvelle-demarche/${brouillon.id}`)}
                        className="h-10 rounded-md text-xs px-4 min-w-[48px] min-h-[48px] font-sans"
                      >
                        Reprendre
                      </Button>
                      <button
                        onClick={() => handleDeleteBrouillon(brouillon.id)}
                        className="h-12 w-12 rounded-md flex items-center justify-center text-red-400 hover:text-[#ED2939] hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search + Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Rechercher par numero, immatriculation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-4 h-12 border-0 border-b border-gray-300 bg-transparent focus:border-[#002395] focus:outline-none transition-colors text-sm font-sans text-[#1A1A1A] placeholder:text-gray-400"
            />
          </div>

          {/* Status filter - text buttons with underline */}
          <div className="flex flex-wrap gap-6">
            {filterChips.map((chip) => (
              <button
                key={chip.value}
                onClick={() => setStatusFilter(chip.value)}
                className={`pb-2 text-sm font-sans font-medium transition-all min-h-[48px] ${
                  statusFilter === chip.value
                    ? "text-[#002395] border-b-2 border-[#002395]"
                    : "text-gray-500 hover:text-[#1A1A1A] border-b-2 border-transparent"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {demarches.length === 0 ? (
            <div className="py-16 text-center border-t border-gray-200">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-serif text-[#1A1A1A] mb-2">Aucune demarche</h3>
              <p className="text-gray-500 mb-6 font-sans text-sm">Vous n'avez pas encore cree de demarche</p>
              <Button
                onClick={() => navigate("/nouvelle-demarche")}
                className="rounded-md px-6 h-12 bg-[#002395] hover:bg-[#001a6e] text-white font-sans"
              >
                Creer ma premiere demarche
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile: Rows with left border accent */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredDemarches.map((demarche, i) => (
                  <motion.div
                    key={demarche.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => navigate(`/demarche/${demarche.id}`)}
                    className={`border-l-4 ${getStatusBorderColor(demarche)} pl-4 py-4 active:bg-gray-50 transition-colors cursor-pointer`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-mono text-xs font-semibold text-[#002395] mb-1">
                          {demarche.numero_demarche}
                        </p>
                        <p className="font-sans font-medium text-[#1A1A1A] text-sm">
                          {typeLabels[demarche.type]}
                        </p>
                      </div>
                      <StatusBadge demarche={demarche} />
                    </div>
                    <div className="flex items-center justify-between text-sm font-sans">
                      <span className="text-gray-500">{demarche.immatriculation}</span>
                      <span className="font-semibold text-[#1A1A1A]">{demarche.montant_ttc?.toFixed(2)} EUR</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400 font-sans">
                        {new Date(demarche.created_at).toLocaleDateString("fr-FR")}
                      </span>
                      {demarche.facture_id && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-sans">
                          <FileText className="h-3 w-3" />
                          Facture
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Desktop: Clean table */}
              <div className="hidden md:block border-t border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="text-xs font-sans font-semibold text-gray-500 uppercase tracking-wider">N. Demarche</TableHead>
                      <TableHead className="text-xs font-sans font-semibold text-gray-500 uppercase tracking-wider">Type</TableHead>
                      <TableHead className="text-xs font-sans font-semibold text-gray-500 uppercase tracking-wider">Immatriculation</TableHead>
                      <TableHead className="text-xs font-sans font-semibold text-gray-500 uppercase tracking-wider">Statut</TableHead>
                      <TableHead className="text-xs font-sans font-semibold text-gray-500 uppercase tracking-wider">Montant</TableHead>
                      <TableHead className="text-xs font-sans font-semibold text-gray-500 uppercase tracking-wider">Facture</TableHead>
                      <TableHead className="text-xs font-sans font-semibold text-gray-500 uppercase tracking-wider">Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDemarches.map((demarche) => (
                      <TableRow
                        key={demarche.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100"
                        onClick={() => navigate(`/demarche/${demarche.id}`)}
                      >
                        <TableCell className="font-mono text-xs font-semibold text-[#002395]">
                          {demarche.numero_demarche}
                        </TableCell>
                        <TableCell className="text-sm font-sans font-medium text-[#1A1A1A]">
                          {typeLabels[demarche.type]}
                        </TableCell>
                        <TableCell className="text-sm font-sans text-gray-600">{demarche.immatriculation}</TableCell>
                        <TableCell>
                          <StatusBadge demarche={demarche} />
                        </TableCell>
                        <TableCell className="text-sm font-sans font-semibold text-[#1A1A1A]">
                          {demarche.montant_ttc?.toFixed(2)} EUR
                        </TableCell>
                        <TableCell>
                          {demarche.facture_id ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-sans font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              <FileText className="h-3 w-3" />
                              Disponible
                            </span>
                          ) : (
                            <span className="text-gray-300 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-sans text-gray-500">
                          {new Date(demarche.created_at).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/demarche/${demarche.id}`);
                            }}
                            className="rounded-md h-10 px-4 text-xs bg-[#002395] hover:bg-[#001a6e] font-sans min-h-[48px]"
                          >
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
