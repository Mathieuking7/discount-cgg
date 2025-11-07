import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, FileText, Plus, LogOut, Menu, X } from "lucide-react";

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [garage, setGarage] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, en_attente: 0, valide: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadGarageData();
    }
  }, [user]);

  const loadGarageData = async () => {
    if (!user) return;

    // Load garage profile
    const { data: garageData } = await supabase
      .from('garages')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (garageData) {
      setGarage(garageData);

      // Load statistics
      const { data: demarches } = await supabase
        .from('demarches')
        .select('status')
        .eq('garage_id', garageData.id);

      if (demarches) {
        setStats({
          total: demarches.length,
          en_attente: demarches.filter(d => d.status === 'en_attente' || d.status === 'en_saisie').length,
          valide: demarches.filter(d => d.status === 'valide' || d.status === 'finalise').length
        });
      }
    }

    setLoading(false);
  };

  if (authLoading || loading) {
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
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center font-bold text-primary-foreground text-lg">
                AD
              </div>
              <div>
                <h1 className="text-xl font-bold">AutoDocs Pro</h1>
                <p className="text-sm text-muted-foreground">{garage?.raison_sociale}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Tableau de bord
              </Button>
              <Button variant="ghost" onClick={() => navigate("/mes-demarches")}>
                <FileText className="mr-2 h-4 w-4" />
                Mes démarches
              </Button>
              <Button onClick={() => navigate("/nouvelle-demarche")}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle démarche
              </Button>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </nav>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigate("/dashboard");
                  setMobileMenuOpen(false);
                }}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Tableau de bord
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigate("/mes-demarches");
                  setMobileMenuOpen(false);
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Mes démarches
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  navigate("/nouvelle-demarche");
                  setMobileMenuOpen(false);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle démarche
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Bienvenue sur votre espace</h2>
          <p className="text-muted-foreground">
            Gérez vos démarches administratives en toute simplicité
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Total des démarches</CardDescription>
              <CardTitle className="text-4xl">{stats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Toutes vos démarches confondues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>En attente</CardDescription>
              <CardTitle className="text-4xl text-orange-600">{stats.en_attente}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Démarches en cours de traitement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Validées</CardDescription>
              <CardTitle className="text-4xl text-green-600">{stats.valide}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Démarches finalisées avec succès
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Démarrez une nouvelle démarche ou consultez l'historique</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              size="lg"
              className="w-full md:w-auto"
              onClick={() => navigate("/nouvelle-demarche")}
            >
              <Plus className="mr-2 h-5 w-5" />
              Créer une nouvelle démarche
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full md:w-auto md:ml-4"
              onClick={() => navigate("/mes-demarches")}
            >
              <FileText className="mr-2 h-5 w-5" />
              Voir toutes mes démarches
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
