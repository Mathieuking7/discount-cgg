import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  CreditCard,
  Bell,
  Layers,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard centralise",
    description:
      "Vue d'ensemble de tous vos dossiers en cours, termines et a completer. Statistiques et KPIs en temps reel.",
  },
  {
    icon: Upload,
    title: "Upload docs securise",
    description:
      "Envoyez vos documents par glisser-deposer. Stockage chiffre, conforme RGPD. Verification automatique des pieces.",
  },
  {
    icon: CreditCard,
    title: "Paiement en ligne integre",
    description:
      "Vos clients paient directement par carte ou virement. Facturation automatique et suivi des encaissements.",
  },
  {
    icon: Bell,
    title: "Notifications temps reel",
    description:
      "Alertes par email et SMS a chaque changement de statut. Vos clients sont informes sans que vous leviez le petit doigt.",
  },
  {
    icon: Layers,
    title: "Multi-demarches",
    description:
      "Carte grise, declaration d'achat, cession, duplicata, changement d'adresse... Tout en un seul endroit.",
  },
  {
    icon: ShieldCheck,
    title: "Securise et fiable",
    description:
      "Paiement crypte SSL 256 bits. Donnees protegees et supprimees apres traitement. Votre confidentialite garantie.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const SIVFlowFeatures = () => {
  return (
    <section id="features" className="py-16 sm:py-24 bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-sm font-medium mb-4">
            Fonctionnalites
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1917] mb-4">
            Tout ce dont vous avez besoin, rien de superflu
          </h2>
          <p className="text-lg text-[#78716C] max-w-2xl mx-auto">
            Une plateforme pensee par et pour les pros de l'auto.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={item}
              className="group rounded-2xl bg-white border border-gray-200 p-6 hover:shadow-lg hover:border-[#2563EB]/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E3A8A]/10 to-[#2563EB]/10 flex items-center justify-center mb-4 group-hover:from-[#1E3A8A]/20 group-hover:to-[#2563EB]/20 transition-colors">
                <f.icon className="w-6 h-6 text-[#2563EB]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1C1917] mb-2">{f.title}</h3>
              <p className="text-sm text-[#78716C] leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SIVFlowFeatures;
