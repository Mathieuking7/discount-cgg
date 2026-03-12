import { motion } from "framer-motion";
import { X, Check, FolderSearch, Clock, AlertTriangle, FileWarning } from "lucide-react";

const painPoints = [
  {
    icon: FolderSearch,
    problem: "Documents disperses entre mails, papiers et SMS",
    solution: "Tous vos documents centralises dans un espace unique et securise",
  },
  {
    icon: Clock,
    problem: "Des heures perdues a relancer l'ANTS et les clients",
    solution: "Suivi en temps reel et notifications automatiques a chaque etape",
  },
  {
    icon: AlertTriangle,
    problem: "Erreurs de saisie qui retardent les dossiers",
    solution: "Formulaires intelligents avec verification automatique des donnees",
  },
  {
    icon: FileWarning,
    problem: "Pas de visibilite sur l'etat de vos demarches",
    solution: "Dashboard complet avec tableau de bord et statistiques en direct",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const SIVFlowProblemSolution = () => {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1917] mb-4">
            Les galeres du SIV, c'est fini
          </h2>
          <p className="text-lg text-[#78716C] max-w-2xl mx-auto">
            Chaque probleme que vous rencontrez au quotidien, SIVFlow l'a resolu.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2"
        >
          {painPoints.map((p, i) => (
            <motion.div
              key={i}
              variants={item}
              className="rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <p.icon className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <X className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-semibold text-red-600">Avant</span>
                  </div>
                  <p className="text-[#78716C] text-sm">{p.problem}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pl-0 sm:pl-0">
                <div className="w-10 h-10 rounded-lg bg-[#0D9488]/10 flex items-center justify-center shrink-0">
                  <p.icon className="w-5 h-5 text-[#0D9488]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-[#0D9488]" />
                    <span className="text-sm font-semibold text-[#0D9488]">Avec King Carte Grise</span>
                  </div>
                  <p className="text-[#1C1917] text-sm font-medium">{p.solution}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SIVFlowProblemSolution;
