import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, DollarSign, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusLabels: Record<string, string> = {
  en_attente: "En attente",
  valide: "Valide",
  refuse: "Refuse",
  rembourse: "Rembourse"
};

const statusColors: Record<string, string> = {
  valide: "bg-green-100 text-green-700",
  refuse: "bg-red-100 text-red-700",
  rembourse: "bg-blue-100 text-blue-700",
  en_attente: "bg-amber-100 text-amber-700"
};

export default function HistoriquePaiements() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [paiements, setPaiements] = useState<any[]>([]);
  const [filteredPaiements, setFilteredPaiements] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      checkAdminAccess();
    }
  }, [user, authLoading]);

  useEffect(() => {
    let filtered = paiements;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.garages?.raison_sociale?.toLowerCase().includes(query) ||
        p.demarches?.numero_demarche?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    setFilteredPaiements(filtered);
  }, [paiements, searchQuery, statusFilter]);

  const checkAdminAccess = async () => {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user?.id)
      .single();

    if (!roles || roles.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    loadPaiements();
  };

  const loadPaiements = async () => {
    const { data, error } = await supabase
      .from('paiements')
      .select(`
        *,
        garages:garage_id (raison_sociale, email),
        demarches:demarche_id (numero_demarche, type)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading paiements:', error);
    } else {
      setPaiements(data || []);
      setFilteredPaiements(data || []);
    }
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6 rounded-full hover:bg-white/80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Historique des paiements</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par garage ou n demarche..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-gray-200"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] rounded-xl border-gray-200">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="valide">Valide</SelectItem>
                <SelectItem value="refuse">Refuse</SelectItem>
                <SelectItem value="rembourse">Rembourse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredPaiements.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Aucun paiement trouve</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Garage</TableHead>
                    <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">N Demarche</TableHead>
                    <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Montant</TableHead>
                    <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Statut</TableHead>
                    <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Stripe ID</TableHead>
                    <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPaiements.map((paiement) => (
                    <TableRow key={paiement.id} className="border-gray-50">
                      <TableCell className="font-medium text-gray-700">
                        {paiement.garages?.raison_sociale}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-600">
                        {paiement.demarches?.numero_demarche}
                      </TableCell>
                      <TableCell className="font-bold text-gray-900">
                        {paiement.montant.toFixed(2)} &euro;
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[paiement.status] || 'bg-gray-100 text-gray-700'}`}>
                          {statusLabels[paiement.status]}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-400">
                        {paiement.stripe_payment_id || '-'}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {new Date(paiement.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
