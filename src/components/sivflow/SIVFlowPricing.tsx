import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Starter",
    price: "59",
    description: "Ideal pour les petits garages et negociants independants",
    popular: false,
    features: [
      "Jusqu'a 30 dossiers / mois",
      "Dashboard centralise",
      "Upload documents securise",
      "Notifications email",
      "Support par email",
      "1 utilisateur",
    ],
  },
  {
    name: "Pro",
    price: "89",
    description: "Pour les professionnels avec un volume regulier de demarches",
    popular: true,
    features: [
      "Dossiers illimites",
      "Dashboard centralise + stats avancees",
      "Upload documents securise",
      "Notifications email + SMS",
      "Paiement en ligne integre",
      "Support prioritaire",
      "Jusqu'a 5 utilisateurs",
      "API disponible",
    ],
  },
];

const SIVFlowPricing = () => {
  return (
    <section id="pricing" className="py-16 sm:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-medium mb-4">
            Tarifs
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1917] mb-4">
            Des tarifs simples et transparents
          </h2>
          <p className="text-lg text-[#78716C] max-w-2xl mx-auto">
            Sans engagement. Changez ou annulez a tout moment.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border-2 p-6 sm:p-8 ${
                plan.popular
                  ? "border-[#2563EB] shadow-xl shadow-[#2563EB]/10"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white px-4 py-1">
                  Plus populaire
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#1C1917] mb-1">{plan.name}</h3>
                <p className="text-sm text-[#78716C] mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#1C1917]">{plan.price}€</span>
                  <span className="text-[#78716C] text-sm">/ mois HT</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-[#0D9488] mt-0.5 shrink-0" />
                    <span className="text-[#1C1917]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full py-5 text-base font-semibold rounded-xl ${
                  plan.popular
                    ? "bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white hover:opacity-90"
                    : "bg-[#1C1917] text-white hover:bg-[#1C1917]/90"
                }`}
              >
                Commencer avec {plan.name}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SIVFlowPricing;
