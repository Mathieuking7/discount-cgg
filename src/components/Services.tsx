import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, FileText, CreditCard, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const Services = () => {
  const [actions, setActions] = useState<Tables<"actions_rapides">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActions = async () => {
      try {
        const { data, error } = await supabase
          .from("actions_rapides")
          .select("*")
          .eq("actif", true)
          .order("ordre");
        
        if (error) throw error;
        setActions(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des actions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadActions();
  }, []);

  const getIconForCode = (code: string) => {
    switch (code) {
      case "DA":
        return ShoppingCart;
      case "DC":
        return FileText;
      case "CG":
      case "CG_DA":
      case "DA_DC":
      case "CG_IMPORT":
        return CreditCard;
      default:
        return FileText;
    }
  };

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <section id="services" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Nos services</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Des solutions adaptées à tous vos besoins administratifs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {actions.map((action) => {
            const Icon = getIconForCode(action.code);
            return (
              <Card key={action.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary">
                <CardHeader>
                  <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl">{action.titre}</CardTitle>
                  <CardDescription className="text-base">
                    {action.description || "Service professionnel pour vos démarches administratives"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-3xl font-bold text-primary">
                      {action.prix}€ {action.code.includes("CG") && "+ prix CG"}
                    </p>
                  </div>
                  <Button 
                    onClick={scrollToContact} 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    En savoir plus
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
