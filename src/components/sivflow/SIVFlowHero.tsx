import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Users, FileCheck, Shield } from "lucide-react";
import { motion } from "framer-motion";

const SIVFlowHero = () => {
  return (
    <section className="relative pt-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/5 via-transparent to-[#0D9488]/5" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              +10 000 clients satisfaits
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1C1917] leading-tight mb-6">
              Gerez vos demarches auto{" "}
              <span className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] bg-clip-text text-transparent">
                en quelques clics
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#78716C] mb-8 max-w-lg mx-auto lg:mx-0">
              Carte grise, declaration d'achat, cession : la plateforme tout-en-un
              pour les professionnels de l'automobile. Fini la paperasse.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white px-8 py-6 text-base font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#2563EB]/25"
              >
                Reserver une demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#1E3A8A]/20 text-[#1C1917] px-8 py-6 text-base font-semibold rounded-xl hover:bg-[#1E3A8A]/5"
              >
                <Play className="w-5 h-5 mr-2" />
                Essayer gratuitement
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap gap-6 sm:gap-10 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0D9488]" />
                <div>
                  <span className="text-2xl font-bold text-[#1C1917]">1 200+</span>
                  <p className="text-xs text-[#78716C]">Pros inscrits</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#0D9488]" />
                <div>
                  <span className="text-2xl font-bold text-[#1C1917]">45 000+</span>
                  <p className="text-xs text-[#78716C]">Dossiers traites</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0D9488]" />
                <div>
                  <span className="text-2xl font-bold text-[#1C1917]">99,8%</span>
                  <p className="text-xs text-[#78716C]">Taux de reussite</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200/50 p-4 sm:p-6">
              {/* Fake dashboard header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-4 flex-1 h-6 bg-gray-100 rounded-md" />
              </div>

              {/* Fake dashboard content */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-[#0D9488]/5 rounded-xl border border-[#0D9488]/10">
                  <div className="w-10 h-10 rounded-lg bg-[#0D9488]/20 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-[#0D9488]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#1C1917]">Carte grise - AB-123-CD</div>
                    <div className="text-xs text-[#78716C]">En cours de traitement</div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#EAB308]/10 text-[#EAB308]">
                    En cours
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#1C1917]">Declaration achat - EF-456-GH</div>
                    <div className="text-xs text-[#78716C]">Termine le 05/03/2026</div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    Termine
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#1C1917]">Cession - IJ-789-KL</div>
                    <div className="text-xs text-[#78716C]">Termine le 02/03/2026</div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    Termine
                  </span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-lg font-bold text-[#1C1917]">12</div>
                  <div className="text-xs text-[#78716C]">Ce mois</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-lg font-bold text-[#0D9488]">3</div>
                  <div className="text-xs text-[#78716C]">En cours</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-lg font-bold text-[#1C1917]">100%</div>
                  <div className="text-xs text-[#78716C]">Reussite</div>
                </div>
              </div>
            </div>

            {/* Floating accent element */}
            <div className="absolute -z-10 -top-6 -right-6 w-48 h-48 bg-gradient-to-br from-[#2563EB]/20 to-[#0D9488]/20 rounded-full blur-3xl" />
            <div className="absolute -z-10 -bottom-6 -left-6 w-32 h-32 bg-[#EAB308]/10 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SIVFlowHero;
