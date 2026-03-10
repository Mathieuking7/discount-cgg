import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ManageSubscriptions() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [garages, setGarages] = useState<any[]>([]);
  const [selectedGarageId, setSelectedGarageId] = useState<string>("");
  const [subscription, setSubscription] = useState({
    plan_type: 'basic',
    price_per_demarche: 8.00,
    margin_percentage: 0
  });

  useEffect(() => {
    if (!authLoading && user) {
      checkAdminAccess();
    }
  }, [user, authLoading]);

  const checkAdminAccess = async () => {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user?.id)
      .single();

    if (!roles || roles.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    loadGarages();
  };

  const loadGarages = async () => {
    const { data } = await supabase
      .from('garages')
      .select(`
        *,
        subscriptions(*)
      `)
      .order('raison_sociale');

    if (data) {
      setGarages(data);
    }
    setLoading(false);
  };

  const loadGarageSubscription = async (garageId: string) => {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('garage_id', garageId)
      .eq('status', 'active')
      .single();

    if (data) {
      setSubscription({
        plan_type: data.plan_type,
        price_per_demarche: data.price_per_demarche,
        margin_percentage: data.margin_percentage || 0
      });
    } else {
      setSubscription({
        plan_type: 'basic',
        price_per_demarche: 8.00,
        margin_percentage: 0
      });
    }
  };

  const handleGarageSelect = (garageId: string) => {
    setSelectedGarageId(garageId);
    loadGarageSubscription(garageId);
  };

  const handlePlanChange = (planType: string) => {
    const prices: Record<string, number> = {
      basic: 8.00,
      pro: 6.50,
      gold: 5.00
    };

    const margins: Record<string, number> = {
      basic: 0,
      pro: 15,
      gold: 25
    };

    setSubscription({
      plan_type: planType,
      price_per_demarche: prices[planType] || 8.00,
      margin_percentage: margins[planType] || 0
    });
  };

  const handleSave = async () => {
    if (!selectedGarageId) {
      toast({
        title: "Erreur",
        description: "Veuillez selectionner un garage",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('garage_id', selectedGarageId)
        .eq('status', 'active')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('subscriptions')
          .update({
            plan_type: subscription.plan_type,
            price_per_demarche: subscription.price_per_demarche,
            margin_percentage: subscription.margin_percentage
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            garage_id: selectedGarageId,
            plan_type: subscription.plan_type,
            price_per_demarche: subscription.price_per_demarche,
            margin_percentage: subscription.margin_percentage,
            status: 'active'
          });

        if (error) throw error;
      }

      if (subscription.plan_type === 'gold') {
        await supabase
          .from('garages')
          .update({ is_gold: true })
          .eq('id', selectedGarageId);
      }

      toast({
        title: "Succes",
        description: "Abonnement mis a jour avec succes"
      });

      loadGarages();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre a jour l'abonnement",
        variant: "destructive"
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-6 rounded-full hover:bg-white/80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Gerer les abonnements</h1>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-700">Selectionner un garage</Label>
              <Select value={selectedGarageId} onValueChange={handleGarageSelect}>
                <SelectTrigger className="rounded-xl border-gray-200">
                  <SelectValue placeholder="Choisir un garage" />
                </SelectTrigger>
                <SelectContent>
                  {garages.map((garage) => (
                    <SelectItem key={garage.id} value={garage.id}>
                      {garage.raison_sociale} - {garage.siret}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedGarageId && (
              <>
                <div className="space-y-2">
                  <Label className="text-gray-700">Type d'abonnement</Label>
                  <Select value={subscription.plan_type} onValueChange={handlePlanChange}>
                    <SelectTrigger className="rounded-xl border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basique</SelectItem>
                      <SelectItem value="pro">Professionnel</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Prix par demarche (&euro;)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={subscription.price_per_demarche}
                    onChange={(e) => setSubscription({
                      ...subscription,
                      price_per_demarche: parseFloat(e.target.value)
                    })}
                    className="rounded-xl border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Marge personnalisable (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={subscription.margin_percentage}
                    onChange={(e) => setSubscription({
                      ...subscription,
                      margin_percentage: parseInt(e.target.value)
                    })}
                    className="rounded-xl border-gray-200"
                  />
                  <p className="text-sm text-gray-400">
                    Le garage pourra ajouter jusqu'a {subscription.margin_percentage}% de marge sur ses demarches
                  </p>
                </div>

                <Button onClick={handleSave} className="w-full rounded-full">
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer l'abonnement
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
