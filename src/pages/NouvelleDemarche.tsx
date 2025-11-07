import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NouvelleDemarche() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [garage, setGarage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    immatriculation: "",
    commentaire: ""
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadGarage();
    }
  }, [user]);

  const loadGarage = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('garages')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setGarage(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!garage) return;

    setLoading(true);

    // Calculate fees based on type
    let frais_dossier = 0;
    switch (formData.type) {
      case 'DA':
        frais_dossier = 10;
        break;
      case 'DC':
        frais_dossier = 10;
        break;
      case 'CG':
        frais_dossier = 30;
        break;
      case 'CG_DA':
        frais_dossier = 35;
        break;
      case 'DA_DC':
        frais_dossier = 15;
        break;
      case 'CG_IMPORT':
        frais_dossier = 50;
        break;
    }

    const { data, error } = await supabase
      .from('demarches')
      .insert({
        garage_id: garage.id,
        type: formData.type,
        immatriculation: formData.immatriculation,
        commentaire: formData.commentaire,
        frais_dossier: frais_dossier,
        montant_ttc: frais_dossier,
        status: 'en_saisie'
      } as any)
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la démarche",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Démarche créée",
        description: "Votre démarche a été créée avec succès"
      });
      navigate("/mes-demarches");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au tableau de bord
        </Button>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Nouvelle démarche</CardTitle>
            <CardDescription>
              Créez une nouvelle démarche administrative pour un véhicule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="type">Type de démarche *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DA">Déclaration d'achat (10€)</SelectItem>
                    <SelectItem value="DC">Déclaration de cession (10€)</SelectItem>
                    <SelectItem value="CG">Carte grise (30€ + coût CG)</SelectItem>
                    <SelectItem value="CG_DA">Carte grise + DA (35€ + coût CG)</SelectItem>
                    <SelectItem value="DA_DC">DA + DC (15€)</SelectItem>
                    <SelectItem value="CG_IMPORT">Import véhicule étranger (50€ + coût CG)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="immatriculation">Immatriculation *</Label>
                <Input
                  id="immatriculation"
                  placeholder="AA-123-BB"
                  value={formData.immatriculation}
                  onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
                <Textarea
                  id="commentaire"
                  placeholder="Informations complémentaires..."
                  value={formData.commentaire}
                  onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Documents requis</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Vous pourrez ajouter les documents nécessaires après la création de la démarche.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Carte grise du véhicule (recto/verso)</li>
                  <li>Certificat de cession ou déclaration d'achat</li>
                  <li>Justificatif d'identité</li>
                  <li>Justificatif de domicile</li>
                  <li>Contrôle technique (si applicable)</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button type="submit" size="lg" disabled={loading} className="flex-1">
                  {loading ? "Création..." : "Créer la démarche"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/dashboard")}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
