import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Edit, Save, X, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

type GuestDemarcheType = {
  id: string;
  code: string;
  titre: string;
  description: string | null;
  prix_base: number;
  ordre: number;
  actif: boolean;
  require_vehicle_info: boolean;
  require_carte_grise_price: boolean;
};

type RequiredDocument = {
  id: string;
  demarche_type_code: string;
  nom_document: string;
  ordre: number;
  obligatoire: boolean;
  actif: boolean;
};

type NewDocument = {
  nom: string;
  obligatoire: boolean;
};

export default function ManageGuestActions() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [actions, setActions] = useState<GuestDemarcheType[]>([]);
  const [documents, setDocuments] = useState<Record<string, RequiredDocument[]>>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingAction, setEditingAction] = useState<GuestDemarcheType | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [newDocuments, setNewDocuments] = useState<NewDocument[]>([]);

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
    await loadData();
  };

  const loadData = async () => {
    setLoading(true);

    const { data: actionsData } = await supabase
      .from('guest_demarche_types')
      .select('*')
      .order('ordre');

    if (actionsData) {
      setActions(actionsData);

      const { data: docsData } = await supabase
        .from('guest_order_required_documents')
        .select('*')
        .order('ordre');

      if (docsData) {
        const docsByCode: Record<string, RequiredDocument[]> = {};
        docsData.forEach(doc => {
          const code = doc.demarche_type_code || '_none';
          if (!docsByCode[code]) {
            docsByCode[code] = [];
          }
          docsByCode[code].push(doc);
        });
        setDocuments(docsByCode);
      }
    }

    setLoading(false);
  };

  const handleCreateAction = () => {
    setEditingAction({
      id: '',
      code: '',
      titre: '',
      description: '',
      prix_base: 0,
      ordre: actions.length + 1,
      actif: true,
      require_vehicle_info: false,
      require_carte_grise_price: false,
    });
    setNewDocuments([{ nom: '', obligatoire: true }]);
    setShowDialog(true);
  };

  const handleEditAction = (action: GuestDemarcheType) => {
    setEditingAction(action);
    const docs = documents[action.code]?.map(d => ({ nom: d.nom_document, obligatoire: d.obligatoire })) || [{ nom: '', obligatoire: true }];
    setNewDocuments(docs);
    setShowDialog(true);
  };

  const handleSaveAction = async () => {
    if (!editingAction) return;

    if (!editingAction.code || !editingAction.titre) {
      toast({
        title: "Erreur",
        description: "Le code et le titre sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (editingAction.id) {
        const { error } = await supabase
          .from('guest_demarche_types')
          .update({
            titre: editingAction.titre,
            description: editingAction.description,
            prix_base: editingAction.prix_base,
            ordre: editingAction.ordre,
            actif: editingAction.actif,
            require_vehicle_info: editingAction.require_vehicle_info,
            require_carte_grise_price: editingAction.require_carte_grise_price,
          })
          .eq('id', editingAction.id);

        if (error) throw error;

        toast({ title: "Demarche mise a jour", description: "La demarche a ete mise a jour avec succes" });
      } else {
        const { error } = await supabase
          .from('guest_demarche_types')
          .insert({
            code: editingAction.code,
            titre: editingAction.titre,
            description: editingAction.description,
            prix_base: editingAction.prix_base,
            ordre: editingAction.ordre,
            actif: editingAction.actif,
            require_vehicle_info: editingAction.require_vehicle_info,
            require_carte_grise_price: editingAction.require_carte_grise_price,
          });

        if (error) throw error;

        const docsToInsert = newDocuments
          .filter(d => d.nom.trim())
          .map((doc, idx) => ({
            demarche_type_code: editingAction.code,
            nom_document: doc.nom,
            ordre: idx + 1,
            obligatoire: doc.obligatoire,
            actif: true,
          }));

        if (docsToInsert.length > 0) {
          await supabase
            .from('guest_order_required_documents')
            .insert(docsToInsert);
        }

        toast({ title: "Demarche creee", description: "La demarche a ete creee avec succes" });
      }

      setShowDialog(false);
      setEditingAction(null);
      setNewDocuments([]);
      await loadData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    if (!confirm("Etes-vous sur de vouloir supprimer cette demarche ?")) return;

    setLoading(true);

    const action = actions.find(a => a.id === actionId);
    if (action) {
      await supabase
        .from('guest_order_required_documents')
        .delete()
        .eq('demarche_type_code', action.code);
    }

    const { error } = await supabase
      .from('guest_demarche_types')
      .delete()
      .eq('id', actionId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la demarche",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Demarche supprimee",
        description: "La demarche a ete supprimee avec succes"
      });
      await loadData();
    }

    setLoading(false);
  };

  const addNewDocument = () => {
    setNewDocuments([...newDocuments, { nom: '', obligatoire: false }]);
  };

  const removeDocument = (index: number) => {
    setNewDocuments(newDocuments.filter((_, i) => i !== index));
  };

  const updateDocument = (index: number, field: 'nom' | 'obligatoire', value: string | boolean) => {
    const updated = [...newDocuments];
    if (field === 'nom') {
      updated[index].nom = value as string;
    } else {
      updated[index].obligatoire = value as boolean;
    }
    setNewDocuments(updated);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-6 rounded-full hover:bg-white/80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour a l'administration
        </Button>

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Actions rapides Particuliers</h1>
              <p className="text-gray-500 text-sm">
                Configurer les types de demarches particuliers, leurs prix et documents requis
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {actions.map((action) => (
            <div key={action.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${!action.actif ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{action.titre}</h3>
                    {!action.actif && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">Inactif</span>}
                  </div>
                  <p className="text-xs text-gray-400">Code: <span className="font-mono font-bold">{action.code}</span></p>
                  <p className="text-xl font-bold text-orange-600 mt-2">{action.prix_base}&euro;</p>
                  <div className="flex gap-1 mt-2">
                    {action.require_vehicle_info && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">Vehicule requis</span>}
                    {action.require_carte_grise_price && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-600">Prix regional</span>}
                  </div>
                </div>
              </div>
              {action.description && (
                <p className="text-sm text-gray-500 mb-3">{action.description}</p>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditAction(action)} className="flex-1 rounded-full text-xs">
                  <Edit className="mr-1.5 h-3 w-3" />
                  Modifier
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteAction(action.id)} className="rounded-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                {editingAction?.id ? 'Modifier la demarche' : 'Nouvelle demarche'}
              </DialogTitle>
              <DialogDescription>
                Configurez les details de la demarche particulier
              </DialogDescription>
            </DialogHeader>

            {editingAction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-gray-700">Code *</Label>
                    <Input
                      id="code"
                      value={editingAction.code}
                      onChange={(e) => setEditingAction({ ...editingAction, code: e.target.value.toUpperCase() })}
                      placeholder="CHGT_ADRESSE..."
                      className="rounded-xl border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prix" className="text-gray-700">Prix base (&euro;) *</Label>
                    <Input
                      id="prix"
                      type="number"
                      step="0.01"
                      value={editingAction.prix_base}
                      onChange={(e) => setEditingAction({ ...editingAction, prix_base: parseFloat(e.target.value) || 0 })}
                      className="rounded-xl border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titre" className="text-gray-700">Titre *</Label>
                  <Input
                    id="titre"
                    value={editingAction.titre}
                    onChange={(e) => setEditingAction({ ...editingAction, titre: e.target.value })}
                    placeholder="Changement d'adresse"
                    className="rounded-xl border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    value={editingAction.description || ''}
                    onChange={(e) => setEditingAction({ ...editingAction, description: e.target.value })}
                    rows={2}
                    className="rounded-xl border-gray-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ordre" className="text-gray-700">Ordre d'affichage</Label>
                    <Input
                      id="ordre"
                      type="number"
                      value={editingAction.ordre}
                      onChange={(e) => setEditingAction({ ...editingAction, ordre: parseInt(e.target.value) || 0 })}
                      className="rounded-xl border-gray-200"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="actif"
                      checked={editingAction.actif}
                      onCheckedChange={(checked) => setEditingAction({ ...editingAction, actif: checked })}
                    />
                    <Label htmlFor="actif" className="text-gray-700">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require_vehicle"
                      checked={editingAction.require_vehicle_info}
                      onCheckedChange={(checked) => setEditingAction({ ...editingAction, require_vehicle_info: checked })}
                    />
                    <Label htmlFor="require_vehicle" className="text-gray-700">Infos vehicule requises</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require_cg_price"
                      checked={editingAction.require_carte_grise_price}
                      onCheckedChange={(checked) => setEditingAction({ ...editingAction, require_carte_grise_price: checked })}
                    />
                    <Label htmlFor="require_cg_price" className="text-gray-700">Prix regional (taxe)</Label>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)} className="rounded-full">
                Annuler
              </Button>
              <Button onClick={handleSaveAction} disabled={loading} className="rounded-full">
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
