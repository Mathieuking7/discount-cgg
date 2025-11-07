import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Connexion réussie",
        description: "Redirection vers votre espace..."
      });
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              AutoDocs Pro
            </CardTitle>
            <CardDescription className="text-center">
              Connectez-vous à votre espace professionnel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email professionnel</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="garage@exemple.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Pas encore de compte ?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold text-primary"
                    onClick={() => navigate("/register")}
                  >
                    Créer un compte professionnel
                  </Button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Plateforme réservée aux professionnels de l'automobile
        </p>
      </div>
    </div>
  );
}
