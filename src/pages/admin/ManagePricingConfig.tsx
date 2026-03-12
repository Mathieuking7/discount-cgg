import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Calculator, Plus, Trash2, Edit, FileText, MapPin, Search, ChevronDown, ChevronRight, Users, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DemarcheType {
  id: string;
  code: string;
  titre: string;
  description: string | null;
  prix_base: number;
  prix_pro: number;
  actif: boolean;
  actif_pro: boolean;
  ordre: number;
  require_vehicle_info: boolean;
  require_carte_grise_price: boolean;
}

type RequiredDocument = {
  id: string;
  nom_document: string;
  ordre: number;
  obligatoire: boolean;
  actif: boolean;
  demarche_type_code: string | null;
};

interface DepartmentTariff {
  id: string;
  code: string;
  label: string;
  tarif: number;
}

interface EditableDemarcheType extends DemarcheType {
  _editedPrixBase?: number;
  _editedPrixPro?: number;
  _dirty?: boolean;
}

const ManagePricingConfig = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [demarcheTypes, setDemarcheTypes] = useState<EditableDemarcheType[]>([]);
  const [documents, setDocuments] = useState<RequiredDocument[]>([]);
  const [departmentTariffs, setDepartmentTariffs] = useState<DepartmentTariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDoc, setEditingDoc] = useState<RequiredDocument | null>(null);
  const [editingType, setEditingType] = useState<DemarcheType | null>(null);
  const [showDocDialog, setShowDocDialog] = useState(false);
  const [showTypeDialog, setShowTypeDialog] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"types" | "tarifs">("types");

  useEffect(() => {
    if (!authLoading && user) {
      checkAdminAndLoad();
    }
  }, [user, authLoading]);

  const checkAdminAndLoad = async () => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user!.id);

    if (!roles?.some((r) => r.role === "admin")) {
      navigate("/");
      return;
    }

    loadData();
  };

  const loadData = async () => {
    try {
      const [typesRes, docsRes, tariffsRes] = await Promise.all([
        supabase.from("guest_demarche_types").select("*").order("ordre"),
        supabase.from("guest_order_required_documents").select("*").order("ordre"),
        supabase.from("department_tariffs").select("*").order("code"),
      ]);

      if (typesRes.error) throw typesRes.error;
      if (tariffsRes.error) throw tariffsRes.error;

      setDemarcheTypes(typesRes.data || []);
      setDocuments(docsRes.data || []);
      setDepartmentTariffs(tariffsRes.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // === INLINE PRICE EDITING ===
  const handleInlinePriceChange = (id: string, field: "base" | "pro", value: number) => {
    setDemarcheTypes((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              _dirty: true,
              ...(field === "base" ? { _editedPrixBase: value } : { _editedPrixPro: value }),
            }
          : t
      )
    );
  };

  const handleToggleTypeActive = async (type: EditableDemarcheType, field: "actif" | "actif_pro") => {
    const newValue = !type[field];
    const { error } = await supabase
      .from("guest_demarche_types")
      .update({ [field]: newValue })
      .eq("id", type.id);

    if (error) {
      toast({ title: "Erreur", description: "Impossible de modifier le statut", variant: "destructive" });
    } else {
      await loadData();
    }
  };

  const handleSaveAllPrices = async () => {
    const dirtyTypes = demarcheTypes.filter((t) => t._dirty);
    if (dirtyTypes.length === 0) {
      toast({ title: "Info", description: "Aucune modification" });
      return;
    }

    setSaving(true);
    try {
      for (const type of dirtyTypes) {
        const { error } = await supabase
          .from("guest_demarche_types")
          .update({
            prix_base: type._editedPrixBase ?? type.prix_base,
            prix_pro: type._editedPrixPro ?? type.prix_pro,
          })
          .eq("id", type.id);
        if (error) throw error;
      }
      toast({ title: "Succes", description: `${dirtyTypes.length} prix mis a jour` });
      await loadData();
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // === DEMARCHE TYPE CRUD (dialog) ===
  const handleCreateType = () => {
    setEditingType({
      id: "",
      code: "",
      titre: "",
      description: "",
      prix_base: 0,
      prix_pro: 0,
      actif: true,
      actif_pro: true,
      ordre: demarcheTypes.length + 1,
      require_vehicle_info: true,
      require_carte_grise_price: false,
    });
    setShowTypeDialog(true);
  };

  const handleEditType = (type: DemarcheType) => {
    setEditingType(type);
    setShowTypeDialog(true);
  };

  const handleSaveType = async () => {
    if (!editingType) return;
    if (!editingType.code.trim() || !editingType.titre.trim()) {
      toast({ title: "Erreur", description: "Le code et le titre sont obligatoires", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: editingType.code,
        titre: editingType.titre,
        description: editingType.description,
        prix_base: editingType.prix_base,
        prix_pro: editingType.prix_pro,
        actif: editingType.actif,
        actif_pro: editingType.actif_pro,
        ordre: editingType.ordre,
        require_vehicle_info: editingType.require_vehicle_info,
        require_carte_grise_price: editingType.require_carte_grise_price,
      };

      if (editingType.id) {
        const { error } = await supabase.from("guest_demarche_types").update(payload).eq("id", editingType.id);
        if (error) throw error;
        toast({ title: "Type mis a jour" });
      } else {
        const { error } = await supabase.from("guest_demarche_types").insert(payload);
        if (error) throw error;
        toast({ title: "Type cree" });
      }
      setShowTypeDialog(false);
      setEditingType(null);
      await loadData();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteType = async (typeId: string) => {
    if (!confirm("Supprimer ce type de demarche ?")) return;
    const { error } = await supabase.from("guest_demarche_types").delete().eq("id", typeId);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    } else {
      toast({ title: "Type supprime" });
      await loadData();
    }
  };

  // === DOCUMENTS ===
  const handleCreateDocForType = (typeCode: string) => {
    setEditingDoc({
      id: "",
      nom_document: "",
      ordre: documents.filter((d) => d.demarche_type_code === typeCode).length + 1,
      obligatoire: true,
      actif: true,
      demarche_type_code: typeCode,
    });
    setShowDocDialog(true);
  };

  const handleEditDocument = (doc: RequiredDocument) => {
    setEditingDoc(doc);
    setShowDocDialog(true);
  };

  const handleSaveDocument = async () => {
    if (!editingDoc) return;
    if (!editingDoc.nom_document.trim()) {
      toast({ title: "Erreur", description: "Le nom du document est obligatoire", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nom_document: editingDoc.nom_document,
        ordre: editingDoc.ordre,
        obligatoire: editingDoc.obligatoire,
        actif: editingDoc.actif,
        demarche_type_code: editingDoc.demarche_type_code,
      };

      if (editingDoc.id) {
        const { error } = await supabase.from("guest_order_required_documents").update(payload).eq("id", editingDoc.id);
        if (error) throw error;
        toast({ title: "Document mis a jour" });
      } else {
        const { error } = await supabase.from("guest_order_required_documents").insert(payload);
        if (error) throw error;
        toast({ title: "Document cree" });
      }
      setShowDocDialog(false);
      setEditingDoc(null);
      await loadData();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Supprimer ce document ?")) return;
    const { error } = await supabase.from("guest_order_required_documents").delete().eq("id", docId);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    } else {
      toast({ title: "Document supprime" });
      await loadData();
    }
  };

  const handleToggleDocActive = async (doc: RequiredDocument) => {
    const { error } = await supabase
      .from("guest_order_required_documents")
      .update({ actif: !doc.actif })
      .eq("id", doc.id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de modifier le statut", variant: "destructive" });
    } else {
      await loadData();
    }
  };

  // === DEPARTMENT TARIFFS ===
  const handleTariffChange = (id: string, value: number) => {
    setDepartmentTariffs((prev) => prev.map((t) => (t.id === id ? { ...t, tarif: value } : t)));
  };

  const handleSaveTariffs = async () => {
    setSaving(true);
    try {
      for (const tariff of departmentTariffs) {
        const { error } = await supabase.from("department_tariffs").update({ tarif: tariff.tarif }).eq("id", tariff.id);
        if (error) throw error;
      }
      toast({ title: "Succes", description: "Tarifs departementaux mis a jour" });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const filteredTariffs = departmentTariffs.filter(
    (t) =>
      t.code.toLowerCase().includes(departmentSearch.toLowerCase()) ||
      t.label.toLowerCase().includes(departmentSearch.toLowerCase())
  );

  const getDocsForType = (code: string) => documents.filter((d) => d.demarche_type_code === code);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2A4A]"></div>
      </div>
    );
  }

  const hasDirtyPrices = demarcheTypes.some((t) => t._dirty);

  return (
    <div className="min-h-screen bg-[#FDF8F0] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="rounded-full hover:bg-white/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Configuration</h1>
            <p className="text-sm text-muted-foreground">
              Demarches, documents requis et tarifs departementaux
            </p>
          </div>
        </div>

        {/* Section nav */}
        <div className="flex gap-2">
          <Button
            variant={activeSection === "types" ? "default" : "outline"}
            onClick={() => setActiveSection("types")}
            className={activeSection === "types" ? "bg-[#1B2A4A] hover:bg-[#1B2A4A]/90" : ""}
          >
            <Calculator className="mr-2 h-4 w-4" />
            Demarches et prix
          </Button>
          <Button
            variant={activeSection === "tarifs" ? "default" : "outline"}
            onClick={() => setActiveSection("tarifs")}
            className={activeSection === "tarifs" ? "bg-[#1B2A4A] hover:bg-[#1B2A4A]/90" : ""}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Tarifs departementaux
          </Button>
        </div>

        {/* === SECTION: DEMARCHES === */}
        {activeSection === "types" && (
          <div className="space-y-6">
            {/* Légende */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-700">Particulier</span>
                <span>— prix et activation pour les clients particuliers</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-violet-500" />
                <span className="font-medium text-violet-700">Pro</span>
                <span>— prix et activation pour les garages/pros</span>
              </div>
            </div>

            {/* Pricing table card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-[#1B2A4A] text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Types de demarches</CardTitle>
                    <CardDescription className="text-white/70">
                      Prix et statut pour particuliers ET professionnels
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasDirtyPrices && (
                      <Button
                        onClick={handleSaveAllPrices}
                        disabled={saving}
                        size="sm"
                        className="bg-white text-[#1B2A4A] hover:bg-white/90"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Sauvegarder les prix
                      </Button>
                    )}
                    <Button
                      onClick={handleCreateType}
                      disabled={saving}
                      size="sm"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Nouveau
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Nom</TableHead>
                      {/* Particulier */}
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Users className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-blue-700 text-xs font-semibold">Prix Particulier (€)</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-blue-700 text-xs font-semibold">Actif Part.</span>
                        </div>
                      </TableHead>
                      {/* Pro */}
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Building2 className="h-3.5 w-3.5 text-violet-500" />
                          <span className="text-violet-700 text-xs font-semibold">Prix Pro (€)</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-violet-500" />
                          <span className="text-violet-700 text-xs font-semibold">Actif Pro</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center">Docs</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demarcheTypes.map((type) => {
                      const typeDocs = getDocsForType(type.code);
                      const isExpanded = expandedType === type.id;
                      const isFullyInactive = !type.actif && !type.actif_pro;

                      return (
                        <React.Fragment key={type.id}>
                          <TableRow
                            className={`${isFullyInactive ? "opacity-40 bg-gray-50" : ""} ${isExpanded ? "bg-blue-50/50" : "hover:bg-gray-50"} cursor-pointer`}
                            onClick={() => setExpandedType(isExpanded ? null : type.id)}
                          >
                            <TableCell className="w-10 px-3">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono text-xs">
                                {type.code}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{type.titre}</p>
                                {type.description && (
                                  <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                                    {type.description}
                                  </p>
                                )}
                              </div>
                            </TableCell>

                            {/* Prix Particulier */}
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <Input
                                type="number"
                                step="0.01"
                                value={type._editedPrixBase ?? type.prix_base}
                                onChange={(e) => handleInlinePriceChange(type.id, "base", parseFloat(e.target.value) || 0)}
                                className={`w-24 text-right inline-block border-blue-200 focus:border-blue-400 ${type._dirty ? "bg-blue-50 border-blue-400" : ""}`}
                              />
                            </TableCell>
                            {/* Actif Particulier */}
                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                              <Switch
                                checked={type.actif}
                                onCheckedChange={() => handleToggleTypeActive(type, "actif")}
                                className="data-[state=checked]:bg-blue-500"
                              />
                            </TableCell>

                            {/* Prix Pro */}
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <Input
                                type="number"
                                step="0.01"
                                value={type._editedPrixPro ?? type.prix_pro}
                                onChange={(e) => handleInlinePriceChange(type.id, "pro", parseFloat(e.target.value) || 0)}
                                className={`w-24 text-right inline-block border-violet-200 focus:border-violet-400 ${type._dirty ? "bg-violet-50 border-violet-400" : ""}`}
                              />
                            </TableCell>
                            {/* Actif Pro */}
                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                              <Switch
                                checked={type.actif_pro}
                                onCheckedChange={() => handleToggleTypeActive(type, "actif_pro")}
                                className="data-[state=checked]:bg-violet-500"
                              />
                            </TableCell>

                            <TableCell className="text-center">
                              <Badge variant="secondary" className="text-xs">
                                {typeDocs.filter((d) => d.actif).length}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditType(type)}>
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDeleteType(type.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Expandable documents section */}
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={9} className="bg-blue-50/30 p-0">
                                <div className="px-6 py-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-[#1B2A4A]" />
                                      <span className="font-semibold text-sm text-[#1B2A4A]">
                                        Documents requis pour {type.code}
                                      </span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCreateDocForType(type.code)}
                                      className="h-7 text-xs"
                                    >
                                      <Plus className="mr-1 h-3 w-3" />
                                      Ajouter
                                    </Button>
                                  </div>

                                  {typeDocs.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic py-2">
                                      Aucun document configure
                                    </p>
                                  ) : (
                                    <div className="space-y-1.5">
                                      {typeDocs.map((doc) => (
                                        <div
                                          key={doc.id}
                                          className={`flex items-center justify-between gap-3 p-2.5 rounded-md bg-white border ${!doc.actif ? "opacity-50" : ""}`}
                                        >
                                          <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <span className="text-sm font-medium truncate">{doc.nom_document}</span>
                                            {doc.obligatoire && (
                                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shrink-0">
                                                Obligatoire
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <Switch
                                              checked={doc.actif}
                                              onCheckedChange={() => handleToggleDocActive(doc)}
                                              className="scale-90"
                                            />
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditDocument(doc)}>
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7 text-red-500 hover:text-red-700"
                                              onClick={() => handleDeleteDocument(doc.id)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>

                {demarcheTypes.length === 0 && (
                  <p className="text-center text-muted-foreground py-12">Aucun type de demarche configure</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* === SECTION: TARIFS DEPARTEMENTAUX === */}
        {activeSection === "tarifs" && (
          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-[#1B2A4A] text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Tarifs departementaux (prix par CV fiscal)</CardTitle>
                    <CardDescription className="text-white/70">
                      Utilises pour calculer le prix de la carte grise
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleSaveTariffs}
                    disabled={saving}
                    size="sm"
                    className="bg-white text-[#1B2A4A] hover:bg-white/90"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Enregistrement..." : "Sauvegarder"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un departement..."
                    value={departmentSearch}
                    onChange={(e) => setDepartmentSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid gap-1.5 max-h-[600px] overflow-y-auto">
                  {filteredTariffs.map((tariff) => (
                    <div
                      key={tariff.id}
                      className="flex items-center justify-between gap-4 p-2.5 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono w-12 justify-center">
                          {tariff.code}
                        </Badge>
                        <span className="text-sm font-medium">{tariff.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={tariff.tarif}
                          onChange={(e) => handleTariffChange(tariff.id, parseFloat(e.target.value) || 0)}
                          className="w-24 text-right"
                        />
                        <span className="text-muted-foreground text-xs w-8">euros/CV</span>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredTariffs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun departement trouve
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-muted/50 border-0">
              <CardContent className="p-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Comment fonctionne le calcul ?</p>
                <p>Taxe regionale = Tarif du departement x Puissance fiscale du vehicule</p>
                <p>Exemple : vehicule 7CV dans le Rhone (43 euros/CV) = 7 x 43 = 301 euros</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Dialog Type de demarche */}
      <Dialog open={showTypeDialog} onOpenChange={setShowTypeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingType?.id ? "Modifier le type" : "Nouveau type de demarche"}</DialogTitle>
            <DialogDescription>Configurez les details du type de demarche</DialogDescription>
          </DialogHeader>

          {editingType && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={editingType.code}
                    onChange={(e) => setEditingType({ ...editingType, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: CG, DA, DC"
                    maxLength={30}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ordre">Ordre d'affichage</Label>
                  <Input
                    id="ordre"
                    type="number"
                    value={editingType.ordre}
                    onChange={(e) => setEditingType({ ...editingType, ordre: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="titre">Titre *</Label>
                <Input
                  id="titre"
                  value={editingType.titre}
                  onChange={(e) => setEditingType({ ...editingType, titre: e.target.value })}
                  placeholder="Ex: Carte Grise (Changement de titulaire)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingType.description || ""}
                  onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                  placeholder="Description de la demarche..."
                  rows={2}
                />
              </div>

              {/* Pricing section */}
              <div className="grid grid-cols-2 gap-4 border rounded-xl p-3 bg-gray-50">
                <div className="space-y-2">
                  <Label htmlFor="prix_base" className="flex items-center gap-1 text-blue-700">
                    <Users className="h-3.5 w-3.5" /> Prix Particulier (€)
                  </Label>
                  <Input
                    id="prix_base"
                    type="number"
                    step="0.01"
                    value={editingType.prix_base}
                    onChange={(e) => setEditingType({ ...editingType, prix_base: parseFloat(e.target.value) || 0 })}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prix_pro" className="flex items-center gap-1 text-violet-700">
                    <Building2 className="h-3.5 w-3.5" /> Prix Pro (€)
                  </Label>
                  <Input
                    id="prix_pro"
                    type="number"
                    step="0.01"
                    value={editingType.prix_pro}
                    onChange={(e) => setEditingType({ ...editingType, prix_pro: parseFloat(e.target.value) || 0 })}
                    className="border-violet-200 focus:border-violet-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border rounded-xl p-3 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Switch
                    id="actif"
                    checked={editingType.actif}
                    onCheckedChange={(checked) => setEditingType({ ...editingType, actif: checked })}
                    className="data-[state=checked]:bg-blue-500"
                  />
                  <Label htmlFor="actif" className="flex items-center gap-1 text-blue-700">
                    <Users className="h-3.5 w-3.5" /> Actif Particulier
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="actif_pro"
                    checked={editingType.actif_pro}
                    onCheckedChange={(checked) => setEditingType({ ...editingType, actif_pro: checked })}
                    className="data-[state=checked]:bg-violet-500"
                  />
                  <Label htmlFor="actif_pro" className="flex items-center gap-1 text-violet-700">
                    <Building2 className="h-3.5 w-3.5" /> Actif Pro
                  </Label>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="require_vehicle"
                    checked={editingType.require_vehicle_info}
                    onCheckedChange={(checked) => setEditingType({ ...editingType, require_vehicle_info: checked })}
                  />
                  <Label htmlFor="require_vehicle">Necessite les infos vehicule</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="require_cg_price"
                    checked={editingType.require_carte_grise_price}
                    onCheckedChange={(checked) => setEditingType({ ...editingType, require_carte_grise_price: checked })}
                  />
                  <Label htmlFor="require_cg_price">Inclut le prix carte grise (taxe regionale)</Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTypeDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveType} disabled={saving} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90">
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Document */}
      <Dialog open={showDocDialog} onOpenChange={setShowDocDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDoc?.id ? "Modifier le document" : "Nouveau document"}</DialogTitle>
            <DialogDescription>Configurez les details du document requis</DialogDescription>
          </DialogHeader>

          {editingDoc && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom du document *</Label>
                <Input
                  id="nom"
                  value={editingDoc.nom_document}
                  onChange={(e) => setEditingDoc({ ...editingDoc, nom_document: e.target.value })}
                  placeholder="Ex: Carte d'identite (recto/verso)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type_code">Type de demarche</Label>
                <Select
                  value={editingDoc.demarche_type_code || ""}
                  onValueChange={(value) => setEditingDoc({ ...editingDoc, demarche_type_code: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {demarcheTypes.map((type) => (
                      <SelectItem key={type.code} value={type.code}>
                        {type.code} - {type.titre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc_ordre">Ordre d'affichage</Label>
                <Input
                  id="doc_ordre"
                  type="number"
                  value={editingDoc.ordre}
                  onChange={(e) => setEditingDoc({ ...editingDoc, ordre: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="obligatoire"
                  checked={editingDoc.obligatoire}
                  onCheckedChange={(checked) => setEditingDoc({ ...editingDoc, obligatoire: checked })}
                />
                <Label htmlFor="obligatoire">Document obligatoire</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="doc_actif"
                  checked={editingDoc.actif}
                  onCheckedChange={(checked) => setEditingDoc({ ...editingDoc, actif: checked })}
                />
                <Label htmlFor="doc_actif">Document actif</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveDocument} disabled={saving} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90">
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagePricingConfig;
