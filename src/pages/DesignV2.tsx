/**
 * DIRECTION 2 — "SPLIT ATLAS"
 * Concept: Mise en page split-screen persistante — colonne gauche fixe couleur,
 * colonne droite scrollable. Comme un magazine automobile de luxe.
 * Inspirations: Ferrari.com, Bentley configurator, Monocle magazine
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  FileCheck,
  Users,
  Clock,
  HeadphonesIcon,
  Check,
  Star,
  Menu,
  X,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

const features = [
  { icon: Shield, title: "Conformité garantie", desc: "Chaque dossier est vérifié automatiquement pour assurer une conformité totale avec la réglementation SIV." },
  { icon: Zap, title: "Traitement instantané", desc: "Soumettez vos demandes et recevez vos certificats en quelques minutes, sans délai administratif." },
  { icon: FileCheck, title: "Suivi en temps réel", desc: "Suivez chaque dossier depuis votre tableau de bord avec des notifications en temps réel." },
  { icon: Users, title: "Multi-utilisateurs", desc: "Gérez les accès de votre équipe avec des rôles et permissions granulaires." },
  { icon: Clock, title: "Historique complet", desc: "Accédez à l'intégralité de votre historique avec archivage sécurisé et recherche avancée." },
  { icon: HeadphonesIcon, title: "Support expert", desc: "Une équipe d'experts SIV disponible pour vous accompagner à chaque étape." },
];

const plans = [
  {
    name: "Starter",
    price: "59",
    desc: "Indépendants",
    features: ["50 dossiers / mois", "1 utilisateur", "Support email", "Historique 12 mois"],
    cta: "Commencer",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "89",
    desc: "Équipes & garages",
    features: ["Dossiers illimités", "Utilisateurs illimités", "Support 24/7", "API & intégrations", "Gestionnaire dédié"],
    cta: "Choisir Pro",
    highlighted: true,
  },
];

const testimonials = [
  { name: "Laurent Mercier", role: "Garage Mercier & Fils", text: "Ce qui prenait des heures se fait maintenant en quelques clics. Un gain de temps considérable.", rating: 5 },
  { name: "Sophie Durand", role: "Auto Prestige Lyon", text: "La fiabilité est remarquable. En deux ans d'utilisation, aucun problème. Le support est exemplaire.", rating: 5 },
  { name: "Marc Lefèvre", role: "FleetCorp — 300 véhicules", text: "SIVFlow est devenu indispensable. L'interface est intuitive et d'une rapidité impressionnante.", rating: 5 },
];

export default function DesignV2() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Navy blue / deep teal palette
  const NAVY = "#0B1D3A";
  const STEEL = "#1E3A5F";
  const ACCENT = "#E8C547"; // warm gold
  const LIGHT = "#F5F0E8"; // warm off-white

  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: LIGHT, color: "#1a1a1a" }}>

      {/* ── MOBILE NAV (only shown below lg) ── */}
      <nav
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
        style={{ backgroundColor: NAVY, color: "white" }}
      >
        <span className="text-lg font-bold tracking-tight">
          <span style={{ color: ACCENT }}>SIV</span>Flow
        </span>
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} color="white" /> : <Menu size={22} color="white" />}
        </button>
        {menuOpen && (
          <div
            className="absolute top-14 left-0 right-0 px-4 pb-4"
            style={{ backgroundColor: NAVY }}
          >
            {["Fonctionnalités", "Tarifs", "Témoignages"].map((l) => (
              <a key={l} href="#" className="block py-2.5 text-sm text-gray-300 border-b border-white/10">
                {l}
              </a>
            ))}
            <a href="#demo" className="mt-3 block text-center py-2.5 text-sm font-bold" style={{ backgroundColor: ACCENT, color: NAVY }}>
              Réserver une démo
            </a>
          </div>
        )}
      </nav>

      {/* ── MAIN LAYOUT: split at lg ── */}
      <div className="lg:flex min-h-screen">

        {/* LEFT COLUMN — fixed sidebar (lg+) */}
        <aside
          className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-[42%] xl:w-[38%]"
          style={{ backgroundColor: NAVY, color: "white" }}
        >
          {/* Logo */}
          <div className="px-10 pt-10 pb-6 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <a href="#" className="text-2xl font-bold tracking-tight">
              <span style={{ color: ACCENT }}>SIV</span>Flow
            </a>
          </div>

          {/* Nav links */}
          <nav className="px-10 py-8 flex flex-col gap-1">
            {["Fonctionnalités", "Tarifs", "Témoignages"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="text-sm py-2 border-l-2 pl-4 transition-all"
                style={{ borderColor: "transparent", color: "#9DB5CC" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = ACCENT;
                  (e.currentTarget as HTMLAnchorElement).style.color = "white";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#9DB5CC";
                }}
              >
                {l}
              </a>
            ))}
          </nav>

          {/* Hero content */}
          <div className="px-10 py-8 flex-1">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-xs uppercase tracking-[0.25em] font-semibold mb-6"
              style={{ color: ACCENT }}
            >
              Agréé professionnels auto
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl xl:text-5xl font-bold leading-tight"
            >
              La référence
              <br />
              des pros
              <br />
              <span style={{ color: ACCENT }}>SIV</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-6 text-sm leading-relaxed"
              style={{ color: "#9DB5CC" }}
            >
              Simplifiez vos démarches d'immatriculation. Rapide, fiable, conforme — sans compromis pour les professionnels de l'automobile.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-8 flex flex-col gap-3"
            >
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 py-3.5 font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: ACCENT, color: NAVY }}
              >
                Réserver une démo <ArrowRight size={16} />
              </a>
              <a
                href="#fonctionnalites"
                className="inline-flex items-center justify-center gap-2 py-3.5 text-sm border transition-all"
                style={{ borderColor: "rgba(255,255,255,0.2)", color: "#9DB5CC" }}
              >
                Découvrir les fonctionnalités <ChevronDown size={16} />
              </a>
            </motion.div>
          </div>

          {/* Stats at bottom */}
          <div className="px-10 py-8 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <div className="grid grid-cols-3 gap-4">
              {[
                { v: "1 200+", l: "Pros actifs" },
                { v: "45k+", l: "Dossiers" },
                { v: "99.8%", l: "Satisfaction" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <p className="text-xl font-bold" style={{ color: ACCENT }}>{s.v}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B8FAA" }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN — scrollable content */}
        <main className="lg:ml-[42%] xl:ml-[38%] pt-14 lg:pt-0">

          {/* Mobile hero */}
          <div
            className="lg:hidden px-4 pt-20 pb-12"
            style={{ backgroundColor: NAVY, color: "white" }}
          >
            <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: ACCENT }}>
              Agréé professionnels auto
            </p>
            <h1 className="text-4xl font-bold leading-tight">
              La référence<br />des pros <span style={{ color: ACCENT }}>SIV</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "#9DB5CC" }}>
              Simplifiez vos démarches d'immatriculation. Rapide, fiable, conforme.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a href="#demo" className="py-3 text-center font-semibold text-sm" style={{ backgroundColor: ACCENT, color: NAVY }}>
                Réserver une démo
              </a>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-2 pt-8 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              {[{ v: "1 200+", l: "Pros" }, { v: "45k+", l: "Dossiers" }, { v: "99.8%", l: "Satisf." }].map((s) => (
                <div key={s.l} className="text-center">
                  <p className="text-xl font-bold" style={{ color: ACCENT }}>{s.v}</p>
                  <p className="text-xs mt-0.5 text-gray-400">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Features section */}
          <section id="fonctionnalites" className="px-6 lg:px-12 xl:px-16 py-16 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs uppercase tracking-[0.25em] font-semibold mb-2" style={{ color: STEEL }}>
                Fonctionnalités
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-10" style={{ color: NAVY }}>
                Tout ce dont vous avez besoin
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="p-6 border-l-4"
                  style={{ borderColor: ACCENT, backgroundColor: "white" }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <f.icon size={20} style={{ color: NAVY }} />
                    <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: NAVY }}>{f.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Pricing section — different background */}
          <section
            id="tarifs"
            className="px-6 lg:px-12 xl:px-16 py-16 lg:py-24"
            style={{ backgroundColor: NAVY, color: "white" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs uppercase tracking-[0.25em] font-semibold mb-2" style={{ color: ACCENT }}>
                Tarifs
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-10">
                Des offres claires
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="p-7"
                  style={{
                    backgroundColor: plan.highlighted ? ACCENT : "rgba(255,255,255,0.05)",
                    color: plan.highlighted ? NAVY : "white",
                  }}
                >
                  <h3 className="text-lg font-bold uppercase">{plan.name}</h3>
                  <p className="text-xs mt-1 opacity-70">{plan.desc}</p>
                  <div className="my-5">
                    <span className="text-4xl font-bold">{plan.price}€</span>
                    <span className="text-sm opacity-60 ml-1">/mois</span>
                  </div>
                  <ul className="space-y-2.5 mb-7">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <Check size={14} className="shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#demo"
                    className="block text-center py-3 text-sm font-bold uppercase tracking-wide transition-all"
                    style={
                      plan.highlighted
                        ? { backgroundColor: NAVY, color: ACCENT }
                        : { border: `1px solid ${ACCENT}`, color: ACCENT }
                    }
                  >
                    {plan.cta}
                  </a>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Testimonials — back to light */}
          <section id="temoignages" className="px-6 lg:px-12 xl:px-16 py-16 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs uppercase tracking-[0.25em] font-semibold mb-2" style={{ color: STEEL }}>
                Témoignages
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-10" style={{ color: NAVY }}>
                Ils nous font confiance
              </h2>
            </motion.div>

            <div className="space-y-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex gap-6 p-6"
                  style={{ backgroundColor: "white", borderLeft: `4px solid ${NAVY}` }}
                >
                  <div className="flex-1">
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={13} className="fill-current" style={{ color: ACCENT }} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">"{t.text}"</p>
                    <p className="font-bold text-xs uppercase" style={{ color: NAVY }}>{t.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA — accent background */}
          <section
            id="demo"
            className="px-6 lg:px-12 xl:px-16 py-16 lg:py-24"
            style={{ backgroundColor: ACCENT }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight" style={{ color: NAVY }}>
                Prêt à simplifier<br />vos démarches ?
              </h2>
              <p className="mt-4 text-sm max-w-md" style={{ color: "rgba(11,29,58,0.7)" }}>
                Rejoignez plus de 1 200 professionnels qui font confiance à SIVFlow pour leurs démarches d'immatriculation.
              </p>
              <a
                href="#"
                className="mt-8 inline-flex items-center gap-2 px-8 py-4 font-bold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: NAVY, color: ACCENT }}
              >
                Réserver une démo gratuite <ArrowRight size={16} />
              </a>
            </motion.div>
          </section>

          {/* Footer */}
          <footer className="px-6 lg:px-12 xl:px-16 py-10 border-t" style={{ borderColor: "#DDD" }}>
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div>
                <p className="font-bold text-lg" style={{ color: NAVY }}>
                  <span style={{ color: ACCENT }}>SIV</span>Flow
                </p>
                <p className="text-xs text-gray-400 mt-1">Plateforme agréée professionnels auto</p>
              </div>
              <div className="flex flex-wrap gap-6 text-xs text-gray-400">
                {["Fonctionnalités", "Tarifs", "Mentions légales", "Contact"].map((l) => (
                  <a key={l} href="#" className="hover:underline">{l}</a>
                ))}
              </div>
            </div>
            <p className="mt-8 text-xs text-gray-300">&copy; {new Date().getFullYear()} SIVFlow. Tous droits réservés.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
