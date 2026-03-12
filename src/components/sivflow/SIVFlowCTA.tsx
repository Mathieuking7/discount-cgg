import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const SIVFlowCTA = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#FAFAF9]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] p-8 sm:p-14 text-center text-white overflow-hidden"
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#0D9488]/20 rounded-full translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Pret a simplifier vos demarches SIV ?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Rejoignez plus de 1 200 professionnels qui gagnent du temps chaque jour
              avec King Carte Grise. Essai gratuit de 14 jours, sans carte bancaire.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-[#1E3A8A] hover:bg-white/90 px-8 py-6 text-base font-semibold rounded-xl"
              >
                Reserver une demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-base font-semibold rounded-xl"
              >
                Essayer gratuitement
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SIVFlowCTA;
