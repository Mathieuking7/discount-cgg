import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { ArrowLeft, Plus, Trash2, Edit, Save, X, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

type ActionRapide = {
  id: string;
  code: string;
  titre: string;
  description: string | null;
  prix: number;
  couleur: string;
  ordre: number;
  actif: boolean;
  require_immatriculation: boolean;
};

type ActionDocument = {
  id: string;
  action_id: string;
  nom_document: string;
  ordre: number;
  obligatoire: boolean;
};

type NewDocument = {
  nom: string;
  obligatoire: boolean;
};

export default function ManageActions() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [actions, setActions] = useState<ActionRapide[]>([]);
  const [documents, setDocuments] = useState<Record<string, ActionDocument[]>>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionRapide | null>(null);
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
      .from('actions_rapides')
      .select('*')
      .order('ordre');

    if (actionsData) {
      setActions(actionsData);

      const { data: docsData } = await supabase
        .from('action_documents')
        .select('*')
        .order('ordre');

      if (docsData) {
        const docsByAction: Record<string, ActionDocument[]> = {};
        docsData.forEach(doc => {
          if (!docsByAction[doc.action_id]) {
            docsByAction[doc.action_id] = [];
          }
          docsByAction[doc.action_id].push(doc);
        });
        setDocuments(docsByAction);
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
      prix: 0,
      couleur: 'primary',
      ordre: actions.length + 1,
      actif: true,
      require_immatriculation: true
    });
    setNewDocuments([{ nom: '', obligatoire: true }]);
    setShowDialog(true);
  };

  const handleEditAction = (action: ActionRapide) => {
    setEditingAction(action);
    const docs = documents[action.id]?.map(d => ({ nom: d.nom_document, obligatoire: d.obligatoire })) || [{ nom: '', obligatoire: true }];
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
          .from('actions_rapides')
          .update({
            code: editingAction.code,
            titre: editingAction.titre,
            description: editingAction.description,
            prix: editingAction.prix,
            couleur: editingAction.couleur,
            ordre: editingAction.ordre,
            actif: editingAction.actif,
            require_immatriculation: editingAction.require_immatriculation
          })
          .eq('id', editingAction.id);

        if (error) throw error;

        await supabase
          .from('action_documents')
          .delete()
          .eq('action_id', editingAction.id);

        const docsToInsert = newDocuments
          .filter(d => d.nom.trim())
          .map((doc, idx) => ({
            action_id: editingAction.id,
            nom_document: doc.nom,
            ordre: idx + 1,
            obligatoire: doc.obligatoire
          }));

        if (docsToInsert.length > 0) {
          await supabase
            .from('action_documents')
            .insert(docsToInsert);
        }

        toast({
          title: "Action mise a jour",
          description: "L'action rapide a ete mise a jour avec succes"
        });
      } else {
        const { data: newAction, error } = await supabase
          .from('actions_rapides')
          .insert({
            code: editingAction.code,
            titre: editingAction.titre,
            description: editingAction.description,
            prix: editingAction.prix,
            couleur: editingAction.couleur,
            ordre: editingAction.ordre,
            actif: editingAction.actif,
            require_immatriculation: editingAction.require_immatriculation
          })
          .select()
          .single();

        if (error) throw error;

        const docsToInsert = newDocuments
          .filter(d => d.nom.trim())
          .map((doc, idx) => ({
            action_id: newAction.id,
            nom_document: doc.nom,
            ordre: idx + 1,
            obligatoire: doc.obligatoire
          }));

        if (docsToInsert.length > 0) {
          await supabase
            .from('action_documents')
            .insert(docsToInsert);
        }

        toast({
          title: "Action creee",
          description: "L'action rapide a ete creee avec succes"
        });
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
    if (!confirm("Etes-vous sur de vouloir supprimer cette action ?")) return;

    setLoading(true);

    const { error } = await supabase
      .from('actions_rapides')
      .delete()
      .eq('id', actionId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'action",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Action supprimee",
        description: "L'action rapide a ete supprimee avec succes"
      });
      await loadData();
    }

    setLoading(false);
  };

  const addNewDocument = () => {
    setNewDocuments([...newDocuments, { nom: '', obligatoire: false }]);
  };

  const removeDocument = (index: number) => {
    if (index === 0) {
      toast({
        title: "Impossible de supprimer",
        description: "Le premier document est obligatoire",
        variant: "destructive"
      });
      return;
    }
    setNewDocuments(newDocuments.filter((_, i) => i !== index));
  };

  const updateDocument = (index: number, field: 'nom' | 'obligatoire', value: string | boolean) => {
    const updated = [...newDocuments];
    if (field === 'nom') {
      updated[index].nom = value as string;
    } else {
      if (index === 0) return;
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 rounded-full hover:bg-white/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour a l'administration
        </Button>

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerer les actions rapides</h1>
              <p className="text-gray-500 text-sm">
                Configurer les types de demarches, leurs prix et documents requis
              </p>
            </div>
          </div>
          <Button onClick={handleCreateAction} className="rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle action
          </Button>
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
                  <p className="text-xl font-bold text-blue-600 mt-2">{action.prix}&euro;</p>
                </div>
                <div
                  className="h-6 w-6 rounded-full border border-gray-200 shadow-sm flex-shrink-0"
                  style={{ backgroundColor: action.couleur.startsWith('#') ? action.couleur : '#3b82f6' }}
                  title={action.couleur}
                />
              </div>
              {action.description && (
                <p className="text-sm text-gray-500 mb-3">{action.description}</p>
              )}

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-1.5">
                  Documents requis ({documents[action.id]?.length || 0})
                </p>
                <ul className="text-xs space-y-0.5">
                  {documents[action.id]?.slice(0, 3).map((doc) => (
                    <li key={doc.id} className="text-gray-400">
                      - {doc.nom_document}
                    </li>
                  ))}
                  {(documents[action.id]?.length || 0) > 3 && (
                    <li className="text-gray-400 italic">
                      ... et {documents[action.id].length - 3} autres
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditAction(action)}
                  className="flex-1 rounded-full text-xs"
                >
                  <Edit className="mr-1.5 h-3 w-3" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteAction(action.id)}
                  className="rounded-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
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
                {editingAction?.id ? 'Modifier l\'action' : 'Nouvelle action'}
              </DialogTitle>
              <DialogDescription>
                Configurez les details de l'action rapide
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
                      placeholder="DA, DC, CG..."
                      className="rounded-xl border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prix" className="text-gray-700">Prix (&euro;) *</Label>
                    <Input
                      id="prix"
                      type="number"
                      value={editingAction.prix}
                      onChange={(e) => setEditingAction({ ...editingAction, prix: parseFloat(e.target.value) || 0 })}
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
                    placeholder="Declaration d'achat"
                    className="rounded-xl border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    value={editingAction.description || ''}
                    onChange={(e) => setEditingAction({ ...editingAction, description: e.target.value })}
                    placeholder="Certificat de cession, declaration d'achat"
                    rows={3}
                    className="rounded-xl border-gray-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="couleur" className="text-gray-700">Couleur</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {[
                        { name: 'Bleu', color: '#3b82f6' },
                        { name: 'Vert', color: '#22c55e' },
                        { name: 'Rouge', color: '#ef4444' },
                        { name: 'Orange', color: '#f97316' },
                        { name: 'Violet', color: '#8b5cf6' },
                        { name: 'Rose', color: '#ec4899' },
                        { name: 'Cyan', color: '#06b6d4' },
                        { name: 'Jaune', color: '#eab308' },
                      ].map((preset) => (
                        <button
                          key={preset.color}
                          type="button"
                          onClick={() => setEditingAction({ ...editingAction, couleur: preset.color })}
                          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${editingAction.couleur === preset.color ? 'ring-2 ring-offset-2 ring-blue-500' : 'border-transparent'}`}
                          style={{ backgroundColor: preset.color }}
                          title={preset.name}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        id="couleur"
                        value={editingAction.couleur.startsWith('#') ? editingAction.couleur : '#3b82f6'}
                        onChange={(e) => setEditingAction({ ...editingAction, couleur: e.target.value })}
                        className="h-10 w-16 cursor-pointer rounded-xl border border-gray-200 bg-white"
                      />
                      <Input
                        value={editingAction.couleur}
                        onChange={(e) => setEditingAction({ ...editingAction, couleur: e.target.value })}
                        placeholder="#3b82f6"
                        className="flex-1 rounded-xl border-gray-200"
                      />
                    </div>
                  </div>

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

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="actif"
                      checked={editingAction.actif}
                      onCheckedChange={(checked) => setEditingAction({ ...editingAction, actif: checked })}
                    />
                    <Label htmlFor="actif" className="text-gray-700">Action active</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require_immat"
                      checked={editingAction.require_immatriculation}
                      onCheckedChange={(checked) => setEditingAction({ ...editingAction, require_immatriculation: checked })}
                    />
                    <Label htmlFor="require_immat" className="text-gray-700">Immatriculation requise</Label>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-gray-700">Documents requis</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addNewDocument} className="rounded-full text-xs">
                      <Plus className="mr-1 h-3 w-3" />
                      Ajouter
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {newDocuments.map((doc, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <Input
                            value={doc.nom}
                            onChange={(e) => updateDocument(idx, 'nom', e.target.value)}
                            placeholder="Nom du document"
                            className="rounded-xl border-gray-200"
                          />
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`obligatoire-${idx}`}
                              checked={doc.obligatoire}
                              onCheckedChange={(checked) => updateDocument(idx, 'obligatoire', checked)}
                              disabled={idx === 0}
                            />
                            <Label htmlFor={`obligatoire-${idx}`} className="text-sm text-gray-500">
                              {idx === 0 ? 'Obligatoire (toujours)' : 'Obligatoire'}
                            </Label>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(idx)}
                          disabled={idx === 0}
                          className="rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
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
