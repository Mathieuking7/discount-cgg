import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkExistingProfile = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate("/login");
        return;
      }

      // Check if user already has a garage profile
      const { data: garageData } = await supabase
        .from("garages")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (garageData) {
        navigate("/dashboard");
        return;
      }

      setChecking(false);
    };

    checkExistingProfile();
  }, [user, authLoading, navigate]);
  
  const [formData, setFormData] = useState({
    raison_sociale: "",
    siret: "",
    adresse: "",
    code_postal: "",
    ville: "",
    telephone: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      // Create garage profile
      const { error: garageError } = await supabase
        .from("garages")
        .insert({
          user_id: user.id,
          raison_sociale: formData.raison_sociale,
          siret: formData.siret,
          adresse: formData.adresse,
          code_postal: formData.code_postal,
          ville: formData.ville,
          email: user.email || "",
          telephone: formData.telephone
        });

      if (garageError) throw garageError;

      // Assign garage role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: "garage"
        });

      if (roleError && !roleError.message.includes("duplicate")) {
        throw roleError;
      }

      toast({
        title: "Profil complété",
        description: "Bienvenue sur DiscountCG !"
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checking) {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Complétez votre profil
            </CardTitle>
            <CardDescription className="text-center">
              Pour accéder à votre espace, veuillez renseigner les informations de votre entreprise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="raison_sociale">Raison sociale *</Label>
                <Input
                  id="raison_sociale"
                  name="raison_sociale"
                  placeholder="Nom de votre entreprise"
                  value={formData.raison_sociale}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siret">Numéro SIRET *</Label>
                <Input
                  id="siret"
                  name="siret"
                  placeholder="123 456 789 00012"
                  value={formData.siret}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse *</Label>
                <Input
                  id="adresse"
                  name="adresse"
                  placeholder="123 rue de Paris"
                  value={formData.adresse}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code_postal">Code postal *</Label>
                  <Input
                    id="code_postal"
                    name="code_postal"
                    placeholder="75001"
                    value={formData.code_postal}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ville">Ville *</Label>
                  <Input
                    id="ville"
                    name="ville"
                    placeholder="Paris"
                    value={formData.ville}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone *</Label>
                <Input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  placeholder="01 23 45 67 89"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Enregistrement..." : "Valider et accéder à mon espace"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
