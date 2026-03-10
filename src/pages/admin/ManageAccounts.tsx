import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Eye, Crown, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ManageAccounts() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [garages, setGarages] = useState<any[]>([]);
  const [selectedGarage, setSelectedGarage] = useState<any>(null);
  const [demarches, setDemarches] = useState<any[]>([]);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      checkAdminAccess();
    }
  }, [user, authLoading]);

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

    loadGarages();
  };

  const loadGarages = async () => {
    const { data, error } = await supabase
      .from('garages')
      .select(`
        *,
        subscriptions(plan_type, status, price_per_demarche, margin_percentage)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setGarages(data);
    }
    setLoading(false);
  };

  const loadGarageDemarches = async (garageId: string) => {
    const { data } = await supabase
      .from('demarches')
      .select('*')
      .eq('garage_id', garageId)
      .order('created_at', { ascending: false });

    setDemarches(data || []);
  };

  const handleViewDetails = async (garage: any) => {
    setSelectedGarage(garage);
    await loadGarageDemarches(garage.id);
    setShowDetailsDialog(true);
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
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Gestion des comptes</h1>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-gray-100">
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Raison sociale</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Email</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Telephone</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">SIRET</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Verifie</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Abonnement</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {garages.map((garage) => (
                <TableRow key={garage.id} className="border-gray-50">
                  <TableCell className="font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      {garage.raison_sociale}
                      {garage.is_gold && <Crown className="h-4 w-4 text-amber-500" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">{garage.email}</TableCell>
                  <TableCell className="text-gray-600 text-sm">{garage.telephone}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">{garage.siret}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${garage.is_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {garage.is_verified ? "Verifie" : "Non verifie"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {garage.subscriptions?.[0] ? (
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{garage.subscriptions[0].plan_type}</span>
                        <p className="text-xs text-gray-400 mt-1">
                          {garage.subscriptions[0].price_per_demarche}&euro;/demarche
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Aucun</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleViewDetails(garage)} className="rounded-full text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Details du compte - {selectedGarage?.raison_sociale}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="bg-[#FDF8F0] rounded-2xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Informations du garage</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">SIRET</p>
                    <p className="font-medium text-gray-700">{selectedGarage?.siret}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
                    <p className="font-medium text-gray-700">{selectedGarage?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Telephone</p>
                    <p className="font-medium text-gray-700">{selectedGarage?.telephone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Adresse</p>
                    <p className="font-medium text-gray-700">
                      {selectedGarage?.adresse}, {selectedGarage?.code_postal} {selectedGarage?.ville}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Date d'inscription</p>
                    <p className="font-medium text-gray-700">
                      {selectedGarage?.created_at && new Date(selectedGarage.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Statut</p>
                    <div className="flex gap-2 mt-1">
                      {selectedGarage?.is_verified && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Verifie</span>}
                      {selectedGarage?.is_gold && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Crown className="h-3 w-3" />Gold</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#FDF8F0] rounded-2xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Demarches ({demarches.length})</h3>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">N Demarche</TableHead>
                      <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Type</TableHead>
                      <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Immatriculation</TableHead>
                      <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Statut</TableHead>
                      <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Montant TTC</TableHead>
                      <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demarches.map((demarche) => (
                      <TableRow key={demarche.id} className="border-gray-100">
                        <TableCell className="font-medium text-gray-700">{demarche.numero_demarche}</TableCell>
                        <TableCell><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{demarche.type}</span></TableCell>
                        <TableCell className="text-gray-600">{demarche.immatriculation}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{demarche.status}</span>
                        </TableCell>
                        <TableCell className="text-gray-700">{demarche.montant_ttc?.toFixed(2) || '0.00'} &euro;</TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {new Date(demarche.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
