import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    raisonSociale: "",
    siret: "",
    email: "",
    telephone: "",
    adresse: "",
    codePostal: "",
    ville: "",
    password: "",
    confirmPassword: "",
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement registration with Lovable Cloud
    console.log("Registration attempt:", formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/login")}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Créer un compte professionnel
            </CardTitle>
            <CardDescription className="text-center">
              Rejoignez AutoDocs Pro et simplifiez vos démarches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informations de l'entreprise</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="raisonSociale">Raison sociale *</Label>
                    <Input
                      id="raisonSociale"
                      placeholder="Garage Martin SARL"
                      value={formData.raisonSociale}
                      onChange={(e) => handleChange("raisonSociale", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siret">SIRET *</Label>
                    <Input
                      id="siret"
                      placeholder="123 456 789 00012"
                      value={formData.siret}
                      onChange={(e) => handleChange("siret", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adresse">Adresse *</Label>
                  <Input
                    id="adresse"
                    placeholder="15 rue de la République"
                    value={formData.adresse}
                    onChange={(e) => handleChange("adresse", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="codePostal">Code postal *</Label>
                    <Input
                      id="codePostal"
                      placeholder="75001"
                      value={formData.codePostal}
                      onChange={(e) => handleChange("codePostal", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ville">Ville *</Label>
                    <Input
                      id="ville"
                      placeholder="Paris"
                      value={formData.ville}
                      onChange={(e) => handleChange("ville", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Coordonnées de contact</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email professionnel *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@garage-martin.fr"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone *</Label>
                    <Input
                      id="telephone"
                      type="tel"
                      placeholder="01 23 45 67 89"
                      value={formData.telephone}
                      onChange={(e) => handleChange("telephone", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Sécurité</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Créer mon compte professionnel
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Vous avez déjà un compte ?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold text-primary"
                    onClick={() => navigate("/login")}
                  >
                    Se connecter
                  </Button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
