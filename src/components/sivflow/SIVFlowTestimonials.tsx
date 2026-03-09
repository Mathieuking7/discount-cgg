import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Jean-Pierre Moreau",
    role: "Gerant, Garage Moreau & Fils",
    avatar: "JP",
    rating: 5,
    text: "Depuis qu'on utilise SIVFlow, on traite nos cartes grises en 10 minutes au lieu d'une heure. Mes mecaniciens ne perdent plus de temps sur la paperasse. Un gain de productivite enorme.",
  },
  {
    name: "Sophie Martin",
    role: "Negociante VO, AutoSelect 33",
    avatar: "SM",
    rating: 5,
    text: "J'achete et revends une vingtaine de vehicules par mois. Avant SIVFlow je passais mes soirees sur les declarations. Maintenant tout est fait dans la journee, sans stress. Je recommande a 100%.",
  },
  {
    name: "Marc Dupont",
    role: "Expert SIV, Cabinet Dupont",
    avatar: "MD",
    rating: 5,
    text: "L'interface est vraiment pensee pour des gens comme moi qui ne sont pas specialement a l'aise avec l'informatique. Tout est clair, pas de jargon inutile. Le support est reactif et competent.",
  },
];

const SIVFlowTestimonials = () => {
  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-[#EAB308]/10 text-[#EAB308] text-sm font-medium mb-4">
            Temoignages
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1917] mb-4">
            Ils font confiance a SIVFlow
          </h2>
          <p className="text-lg text-[#78716C] max-w-2xl mx-auto">
            Des professionnels de l'automobile comme vous, partout en France.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-[#EAB308] text-[#EAB308]" />
                ))}
              </div>

              <p className="text-sm text-[#1C1917] leading-relaxed mb-6">"{t.text}"</p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#1C1917]">{t.name}</div>
                  <div className="text-xs text-[#78716C]">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SIVFlowTestimonials;
