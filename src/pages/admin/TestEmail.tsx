import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

export default function TestEmail() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Non authentifie",
          description: "Vous devez etre connecte pour acceder a cette page",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }

      // Check admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (!roles?.some((r) => r.role === "admin")) {
        navigate("/");
        return;
      }

      setIsAuthenticated(true);
      setCheckingAuth(false);
    };
    checkAuth();
  }, [navigate, toast]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const sendTestEmail = async () => {
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un email",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();

      if (sessionError || !session) {
        console.error('Session refresh failed:', sessionError);
        toast({
          title: "Session expiree",
          description: "Veuillez vous reconnecter",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }


      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'order_confirmation',
          to: email,
          data: {
            tracking_number: 'TEST-2025-001',
            nom: 'Test',
            prenom: 'Utilisateur',
            immatriculation: 'AB-123-CD',
            montant_ttc: 49.99
          }
        }
      });


      if (error) {
        console.error('Email error:', error);
        toast({
          title: "Erreur",
          description: `Erreur: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email envoye",
          description: "Email de test envoye avec succes"
        });
      }
    } catch (err: any) {
      console.error('Catch error:', err);
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6 rounded-full hover:bg-white/80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Test d'envoi d'email</h1>
              <p className="text-sm text-gray-500">
                Testez l'envoi d'emails avec les templates configures
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email destinataire</label>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border-gray-200"
              />
            </div>
            <Button onClick={sendTestEmail} disabled={loading} className="rounded-full w-full">
              {loading ? "Envoi..." : "Envoyer un email de test"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
