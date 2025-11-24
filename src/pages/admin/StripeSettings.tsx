import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StripeSettings() {
  const [currentMode, setCurrentMode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  const fetchCurrentMode = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-stripe-key');
      
      if (error) throw error;
      
      setCurrentMode(data.mode || 'test');
    } catch (error) {
      console.error('Error fetching Stripe mode:', error);
      toast.error("Erreur lors de la récupération du mode Stripe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentMode();
  }, []);

  const switchMode = async (newMode: 'test' | 'live') => {
    if (newMode === currentMode) return;

    const confirmMessage = newMode === 'live'
      ? "⚠️ Attention ! Vous allez passer en mode PRODUCTION. Les paiements seront réels. Êtes-vous sûr ?"
      : "Passer en mode TEST ? Les paiements ne seront pas réels.";

    if (!confirm(confirmMessage)) return;

    try {
      setSwitching(true);

      // On doit mettre à jour le secret STRIPE_MODE via l'interface Supabase
      toast.info("Veuillez mettre à jour le secret STRIPE_MODE dans les paramètres Supabase", {
        description: `Nouvelle valeur: ${newMode}`,
        duration: 10000,
      });

      // Rafraîchir après quelques secondes pour laisser le temps de mettre à jour
      setTimeout(() => {
        fetchCurrentMode();
        setSwitching(false);
      }, 3000);
    } catch (error) {
      console.error('Error switching mode:', error);
      toast.error("Erreur lors du changement de mode");
      setSwitching(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configuration Stripe</h1>
        <p className="text-muted-foreground">
          Gérez le mode de fonctionnement de Stripe (test ou production)
        </p>
      </div>

      <Alert>
        <AlertDescription>
          Pour changer de mode, vous devez mettre à jour le secret <code className="px-1.5 py-0.5 bg-muted rounded">STRIPE_MODE</code> dans les paramètres Lovable Cloud.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Mode Actuel
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCurrentMode}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Rafraîchir
            </Button>
          </CardTitle>
          <CardDescription>
            Le mode détermine si les paiements sont réels ou de test
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
            <Badge 
              variant={currentMode === 'live' ? 'destructive' : 'secondary'}
              className="text-2xl px-6 py-3"
            >
              {currentMode === 'live' ? '🔴 PRODUCTION' : '🔵 TEST'}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className={currentMode === 'test' ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle className="text-lg">Mode Test</CardTitle>
                <CardDescription>
                  Utilise les clés de test Stripe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-sm space-y-2">
                  <li>✓ Paiements simulés</li>
                  <li>✓ Aucun argent réel</li>
                  <li>✓ Idéal pour le développement</li>
                </ul>
                <Button
                  variant={currentMode === 'test' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => switchMode('test')}
                  disabled={currentMode === 'test' || switching}
                >
                  {currentMode === 'test' ? 'Mode actif' : 'Activer le mode test'}
                </Button>
              </CardContent>
            </Card>

            <Card className={currentMode === 'live' ? 'border-destructive' : ''}>
              <CardHeader>
                <CardTitle className="text-lg text-destructive">
                  Mode Production
                </CardTitle>
                <CardDescription>
                  Utilise les clés de production Stripe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-sm space-y-2">
                  <li>⚠️ Paiements réels</li>
                  <li>⚠️ Argent réel débité</li>
                  <li>⚠️ À utiliser avec précaution</li>
                </ul>
                <Button
                  variant={currentMode === 'live' ? 'destructive' : 'outline'}
                  className="w-full"
                  onClick={() => switchMode('live')}
                  disabled={currentMode === 'live' || switching}
                >
                  {currentMode === 'live' ? 'Mode actif' : 'Activer le mode production'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              <strong>Note:</strong> Pour changer de mode, mettez à jour le secret STRIPE_MODE avec la valeur "test" ou "live" dans les paramètres Lovable Cloud, puis rafraîchissez cette page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
