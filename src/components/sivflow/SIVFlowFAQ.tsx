import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "King Carte Grise est-il habilite par l'Etat ?",
    answer:
      "Oui, King Carte Grise est habilite par le Ministere de l'Interieur et connecte directement au Systeme d'Immatriculation des Vehicules (SIV). Toutes les demarches sont realisees dans un cadre officiel et securise.",
  },
  {
    question: "Combien de temps faut-il pour configurer mon compte ?",
    answer:
      "La mise en route prend moins de 15 minutes. Vous renseignez vos informations professionnelles, uploadez vos justificatifs, et vous pouvez commencer a traiter vos premiers dossiers immediatement.",
  },
  {
    question: "Puis-je gerer plusieurs types de demarches ?",
    answer:
      "Absolument. King Carte Grise prend en charge les cartes grises, declarations d'achat, declarations de cession, changements d'adresse, duplicatas et bien d'autres demarches SIV. Tout depuis une seule interface.",
  },
  {
    question: "Mes donnees sont-elles en securite ?",
    answer:
      "Toutes les donnees sont chiffrees en transit et au repos. Notre infrastructure est hebergee en France, conforme au RGPD. Les documents sont stockes de maniere securisee et accessibles uniquement par vous.",
  },
  {
    question: "Y a-t-il un engagement minimum ?",
    answer:
      "Non, nos abonnements sont sans engagement. Vous pouvez changer de formule ou annuler a tout moment depuis votre espace. Le mois en cours reste actif jusqu'a sa fin.",
  },
  {
    question: "Comment fonctionne le support client ?",
    answer:
      "Le support est disponible par email et chat en direct du lundi au vendredi de 9h a 18h. Les clients Pro beneficient d'un support prioritaire avec un temps de reponse garanti sous 2 heures.",
  },
  {
    question: "Puis-je essayer King Carte Grise gratuitement ?",
    answer:
      "Oui, nous proposons un essai gratuit de 14 jours avec acces complet a toutes les fonctionnalites. Aucune carte bancaire n'est requise pour demarrer.",
  },
  {
    question: "King Carte Grise est-il adapte aux petits volumes ?",
    answer:
      "Tout a fait. Notre offre Starter est concue pour les professionnels qui traitent jusqu'a 30 dossiers par mois. C'est ideal pour un garage independant ou un negociant qui debute.",
  },
];

const SIVFlowFAQ = () => {
  return (
    <section id="faq" className="py-16 sm:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1917] mb-4">
            Questions frequentes
          </h2>
          <p className="text-lg text-[#78716C]">
            Tout ce que vous devez savoir avant de demarrer.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-[#FAFAF9] border border-gray-200 rounded-xl px-5 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-[#1C1917] hover:text-[#2563EB] py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-[#78716C] leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default SIVFlowFAQ;
