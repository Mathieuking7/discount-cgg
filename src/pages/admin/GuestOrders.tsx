import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Eye, Package } from "lucide-react";
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

const statusConfig: Record<string, { label: string; color: string }> = {
  en_attente: { label: "En attente", color: "bg-amber-100 text-amber-700" },
  valide: { label: "Valide", color: "bg-blue-100 text-blue-700" },
  finalise: { label: "Finalise", color: "bg-green-100 text-green-700" },
  refuse: { label: "Refuse", color: "bg-red-100 text-red-700" },
};

export default function GuestOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<GuestOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<GuestOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      checkAdminAndLoadData();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = orders.filter(
        (order) =>
          order.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.immatriculation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchQuery, orders]);

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
      setFilteredOrders(data || []);
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
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-6 rounded-full hover:bg-white/80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au dashboard
        </Button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Commandes Particuliers</h1>
              <p className="text-sm text-gray-500">
                Gerer les commandes des clients sans compte ({orders.length} commande{orders.length > 1 ? "s" : ""})
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par numero, immatriculation, nom, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-gray-200"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100">
                  <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">N Commande</TableHead>
                  <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Type</TableHead>
                  <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Client</TableHead>
                  <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Immatriculation</TableHead>
                  <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Montant</TableHead>
                  <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Statut</TableHead>
                  <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Paiement</TableHead>
                  <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Documents</TableHead>
                  <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Date</TableHead>
                  <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-gray-400 py-8">
                      Aucune commande trouvee
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const status = statusConfig[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" };
                    return (
                      <TableRow key={order.id} className="border-gray-50">
                        <TableCell className="font-mono font-medium text-gray-700 text-sm">
                          {order.tracking_number}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {order.demarche_type === 'DA' ? "DA" :
                             order.demarche_type === 'DC' ? "DC" : "CG"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-700 text-sm">{order.prenom} {order.nom}</p>
                            <p className="text-xs text-gray-400">{order.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-gray-600">{order.immatriculation}</TableCell>
                        <TableCell className="font-medium text-gray-900">{order.montant_ttc.toFixed(2)} &euro;</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.paye ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {order.paye ? "Paye" : "Non paye"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.documents_complets ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {order.documents_complets ? "Complets" : "Incomplets"}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {new Date(order.created_at).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/guest-order/${order.id}`)}
                            className="rounded-full hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4 text-gray-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
