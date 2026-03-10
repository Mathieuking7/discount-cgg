import { useState, useEffect, useMemo } from "react";
import DOMPurify from "dompurify";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Eye, Save, Mail } from "lucide-react";

interface EmailTemplate {
  id: string;
  type: string;
  subject: string;
  html_content: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const ManageEmailTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("type");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error("Error loading templates:", error);
      toast.error("Erreur lors du chargement des templates");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditedSubject(template.subject);
    setEditedContent(template.html_content);
    setEditedDescription(template.description || "");
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    try {
      const { error } = await supabase
        .from("email_templates")
        .update({
          subject: editedSubject,
          html_content: editedContent,
          description: editedDescription,
        })
        .eq("id", selectedTemplate.id);

      if (error) throw error;

      toast.success("Template mis a jour avec succes");
      loadTemplates();
      setSelectedTemplate(null);
    } catch (error: any) {
      console.error("Error updating template:", error);
      toast.error("Erreur lors de la mise a jour");
    }
  };

  const handlePreview = (template: EmailTemplate) => {
    let html = template.html_content;
    const replacements = {
      "{{tracking_number}}": "TRK-2025-000123",
      "{{prenom}}": "Jean",
      "{{nom}}": "Dupont",
      "{{immatriculation}}": "AB-123-CD",
      "{{montant_ttc}}": "149.90",
      "{{marque}}": "Renault",
      "{{modele}}": "Clio",
      "{{tracking_url}}": "https://votresite.fr/suivi/TRK-2025-000123",
    };

    Object.entries(replacements).forEach(([key, value]) => {
      html = html.replace(new RegExp(key, "g"), value);
    });

    setPreviewHtml(html);
  };

  const getTemplateLabel = (type: string) => {
    const labels: Record<string, string> = {
      order_confirmation: "Confirmation de commande",
      payment_confirmed: "Paiement confirme",
      documents_received: "Documents recus",
      processing: "En traitement",
      completed: "Dossier finalise",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="rounded-full hover:bg-white/80">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Mail className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Templates Email</h1>
              <p className="text-gray-500 text-sm">
                Personnalisez les emails envoyes automatiquement
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-purple-500" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{getTemplateLabel(template.type)}</h3>
              </div>
              <p className="text-xs text-gray-400 mb-3">{template.description}</p>
              <div className="mb-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Sujet</p>
                <p className="text-sm font-medium text-gray-700 truncate">{template.subject}</p>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-full text-xs"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Previsualiser
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900">Previsualisation - {getTemplateLabel(template.type)}</DialogTitle>
                      <DialogDescription>
                        Apercu avec des donnees d'exemple
                      </DialogDescription>
                    </DialogHeader>
                    <div
                      className="border border-gray-100 rounded-xl p-4 bg-white"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewHtml) }}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={selectedTemplate?.id === template.id}
                  onOpenChange={(open) => !open && setSelectedTemplate(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="flex-1 rounded-full text-xs"
                      onClick={() => handleEdit(template)}
                    >
                      Modifier
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900">Modifier le template - {getTemplateLabel(template.type)}</DialogTitle>
                      <DialogDescription>
                        Utilisez les variables : {"{{"}tracking_number{"}}"}, {"{{"}prenom{"}}"}, {"{{"}nom{"}}"}, {"{{"}immatriculation{"}}"}, {"{{"}montant_ttc{"}}"}, {"{{"}marque{"}}"}, {"{{"}modele{"}}"}, {"{{"}tracking_url{"}}"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-700">Description</Label>
                        <Input
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          placeholder="Description du template"
                          className="rounded-xl border-gray-200"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700">Sujet de l'email</Label>
                        <Input
                          value={editedSubject}
                          onChange={(e) => setEditedSubject(e.target.value)}
                          placeholder="Sujet de l'email"
                          className="rounded-xl border-gray-200"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700">Contenu HTML</Label>
                        <Textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          placeholder="Contenu HTML de l'email"
                          className="min-h-[400px] font-mono text-sm rounded-xl border-gray-200"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setSelectedTemplate(null)} className="rounded-full">
                          Annuler
                        </Button>
                        <Button onClick={handleSave} className="rounded-full">
                          <Save className="h-4 w-4 mr-2" />
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/70 rounded-2xl border border-gray-100 shadow-sm p-5 mt-6">
          <h3 className="font-semibold text-gray-700 text-sm mb-3">Variables disponibles</h3>
          <p className="text-xs text-gray-400 mb-4">
            Utilisez ces variables dans vos templates pour personnaliser les emails
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { var: "{{tracking_number}}", desc: "Numero de suivi" },
              { var: "{{prenom}}", desc: "Prenom du client" },
              { var: "{{nom}}", desc: "Nom du client" },
              { var: "{{immatriculation}}", desc: "Immatriculation" },
              { var: "{{montant_ttc}}", desc: "Montant TTC" },
              { var: "{{marque}}", desc: "Marque du vehicule" },
              { var: "{{modele}}", desc: "Modele du vehicule" },
              { var: "{{tracking_url}}", desc: "URL de suivi" },
            ].map((item) => (
              <div key={item.var} className="space-y-1">
                <code className="text-xs bg-[#FDF8F0] px-2 py-1 rounded-lg text-gray-700">{item.var}</code>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEmailTemplates;
