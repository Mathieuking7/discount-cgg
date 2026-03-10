/**
 * DIRECTION 1 — "FORGE NOIRE"
 * Concept: Dark industrial — comme un tableau de bord de cockpit professionnel.
 * Fond texturé anthracite, accent or/ambre, typographie condensée bold.
 * Inspirations: Bloomberg Terminal, Porsche Design, Aston Martin configurator
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
  ChevronRight,
} from "lucide-react";

const stats = [
  { value: "1 200+", label: "Professionnels actifs" },
  { value: "45 000+", label: "Dossiers traités" },
  { value: "99.8%", label: "Satisfaction client" },
];

const features = [
  {
    icon: Shield,
    title: "Conformité garantie",
    desc: "Chaque dossier est vérifié automatiquement pour assurer une conformité totale avec la réglementation SIV.",
  },
  {
    icon: Zap,
    title: "Traitement instantané",
    desc: "Soumettez vos demandes et recevez vos certificats en quelques minutes, sans délai administratif.",
  },
  {
    icon: FileCheck,
    title: "Suivi en temps réel",
    desc: "Suivez l'avancement de chaque dossier depuis votre tableau de bord avec des notifications en temps réel.",
  },
  {
    icon: Users,
    title: "Multi-utilisateurs",
    desc: "Gérez les accès de votre équipe avec des rôles et permissions granulaires pour chaque collaborateur.",
  },
  {
    icon: Clock,
    title: "Historique complet",
    desc: "Accédez à l'intégralité de votre historique de démarches avec archivage sécurisé et recherche avancée.",
  },
  {
    icon: HeadphonesIcon,
    title: "Support dédié",
    desc: "Une équipe d'experts SIV disponible pour vous accompagner à chaque étape de vos démarches.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "59",
    desc: "Indépendants et petites structures",
    features: ["50 dossiers / mois", "Tableau de bord complet", "Support email", "Historique 12 mois", "1 utilisateur"],
    cta: "Commencer",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "89",
    desc: "Professionnels exigeants et équipes",
    features: ["Dossiers illimités", "Tableau de bord avancé", "Support 24/7", "Historique illimité", "Utilisateurs illimités", "API & intégrations", "Gestionnaire dédié"],
    cta: "Choisir Pro",
    highlighted: true,
  },
];

const testimonials = [
  {
    name: "Laurent Mercier",
    role: "Gérant, Garage Mercier & Fils",
    text: "SIVFlow a transformé notre gestion administrative. Ce qui prenait des heures se fait maintenant en quelques clics.",
    rating: 5,
  },
  {
    name: "Sophie Durand",
    role: "Directrice, Auto Prestige Lyon",
    text: "La fiabilité de la plateforme est remarquable. En deux ans d'utilisation, nous n'avons rencontré aucun problème.",
    rating: 5,
  },
  {
    name: "Marc Lefèvre",
    role: "Responsable administratif, FleetCorp",
    text: "Avec plus de 300 véhicules à gérer, SIVFlow est devenu indispensable. La rapidité de traitement est impressionnante.",
    rating: 5,
  },
];

export default function DesignV1() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen text-white font-sans antialiased"
      style={{
        backgroundColor: "#111115",
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 39px,
            rgba(255,255,255,0.02) 39px,
            rgba(255,255,255,0.02) 40px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 39px,
            rgba(255,255,255,0.02) 39px,
            rgba(255,255,255,0.02) 40px
          )
        `,
      }}
    >
      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{
          backgroundColor: "rgba(17,17,21,0.95)",
          borderColor: "#D4A017",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <a href="#" className="flex items-center gap-2">
            <span
              className="text-xl font-black tracking-tighter uppercase"
              style={{ fontFamily: "'Arial Black', sans-serif", color: "#D4A017" }}
            >
              SIV
            </span>
            <span className="text-xl font-black tracking-tighter uppercase text-white" style={{ fontFamily: "'Arial Black', sans-serif" }}>
              FLOW
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {["Fonctionnalités", "Tarifs", "Témoignages"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs uppercase tracking-[0.15em] font-semibold transition-colors"
                style={{ color: "#9CA3AF" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#D4A017")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
              >
                {link}
              </a>
            ))}
            <a
              href="#demo"
              className="px-5 py-2 text-xs font-black uppercase tracking-wider transition-all"
              style={{
                backgroundColor: "#D4A017",
                color: "#111115",
                clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
              }}
            >
              Demo gratuite
            </a>
          </div>

          <button className="md:hidden text-gray-400" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 border-t" style={{ borderColor: "rgba(212,160,23,0.2)" }}>
            {["Fonctionnalités", "Tarifs", "Témoignages"].map((link) => (
              <a key={link} href="#" className="block py-2.5 text-xs uppercase tracking-widest text-gray-400">
                {link}
              </a>
            ))}
            <a href="#demo" className="mt-3 block text-center py-2.5 text-xs font-black uppercase tracking-wider" style={{ backgroundColor: "#D4A017", color: "#111115" }}>
              Demo gratuite
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-14 overflow-hidden">
        {/* Gold accent bar left */}
        <div className="absolute left-0 top-14 bottom-0 w-1" style={{ backgroundColor: "#D4A017" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-20 pb-24 lg:pt-32 lg:pb-36">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p
              className="text-xs uppercase tracking-[0.3em] font-semibold mb-6"
              style={{ color: "#D4A017" }}
            >
              Plateforme SIV — Agréé professionnels auto
            </p>
            <h1
              className="text-5xl sm:text-6xl lg:text-8xl font-black uppercase leading-none tracking-tight"
              style={{ fontFamily: "'Arial Black', Impact, sans-serif" }}
            >
              <span className="block">GÉREZ</span>
              <span className="block" style={{ WebkitTextStroke: "2px #D4A017", color: "transparent" }}>
                VOS
              </span>
              <span className="block">DOSSIERS</span>
              <span className="block" style={{ color: "#D4A017" }}>SIV.</span>
            </h1>

            <p className="mt-8 text-base text-gray-400 max-w-xl leading-relaxed">
              La plateforme professionnelle d'immatriculation conçue pour les garages et concessionnaires. Rapide, fiable, conforme — sans compromis.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 font-black uppercase tracking-wider text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: "#D4A017", color: "#111115" }}
              >
                Réserver une démo <ArrowRight size={16} />
              </a>
              <a
                href="#fonctionnalites"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-sm border transition-all"
                style={{ borderColor: "rgba(212,160,23,0.4)", color: "#D4A017" }}
              >
                Voir les fonctionnalités <ChevronRight size={16} />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div
          className="border-y"
          style={{ borderColor: "rgba(212,160,23,0.25)", backgroundColor: "rgba(212,160,23,0.04)" }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-3 divide-x" style={{ divideColor: "rgba(212,160,23,0.25)" }}>
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="py-8 px-4 sm:px-8 text-center"
                >
                  <p
                    className="text-3xl sm:text-4xl font-black"
                    style={{ color: "#D4A017", fontFamily: "'Arial Black', sans-serif" }}
                  >
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-gray-500">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="fonctionnalites" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end gap-6 mb-16">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: "#D4A017" }}>
                01 — Fonctionnalités
              </p>
              <h2
                className="text-4xl sm:text-5xl font-black uppercase leading-tight"
                style={{ fontFamily: "'Arial Black', sans-serif" }}
              >
                TOUT CE DONT<br />VOUS AVEZ BESOIN
              </h2>
            </div>
            <div className="hidden lg:block flex-1 h-px mb-4" style={{ backgroundColor: "rgba(212,160,23,0.3)" }} />
          </div>

          {/* Feature grid — alternating full-width rows */}
          <div className="space-y-px">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-start gap-6 p-6 border-l-2 transition-all group cursor-default"
                style={{
                  borderColor: "rgba(212,160,23,0.15)",
                  backgroundColor: "rgba(255,255,255,0.01)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#D4A017";
                  (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(212,160,23,0.04)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,160,23,0.15)";
                  (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.01)";
                }}
              >
                <div
                  className="shrink-0 w-10 h-10 flex items-center justify-center"
                  style={{ backgroundColor: "rgba(212,160,23,0.1)", color: "#D4A017" }}
                >
                  <f.icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base uppercase tracking-wide mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
                <div className="ml-auto shrink-0 self-center">
                  <ChevronRight size={16} className="text-gray-700 group-hover:text-yellow-500 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section
        id="tarifs"
        className="py-24 px-4"
        style={{ backgroundColor: "rgba(0,0,0,0.4)", borderTop: "1px solid rgba(212,160,23,0.15)", borderBottom: "1px solid rgba(212,160,23,0.15)" }}
      >
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: "#D4A017" }}>
            02 — Tarifs
          </p>
          <h2 className="text-4xl sm:text-5xl font-black uppercase mb-16" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            OFFRES CLAIRES.<br />SANS SURPRISE.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px max-w-4xl" style={{ backgroundColor: "rgba(212,160,23,0.2)" }}>
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="p-8 lg:p-10"
                style={{ backgroundColor: plan.highlighted ? "rgba(212,160,23,0.06)" : "#111115" }}
              >
                {plan.highlighted && (
                  <p className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: "#D4A017" }}>
                    — Recommandé —
                  </p>
                )}
                <h3 className="text-2xl font-black uppercase">{plan.name}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{plan.desc}</p>
                <div className="my-8 flex items-baseline gap-1">
                  <span className="text-5xl font-black" style={{ color: "#D4A017" }}>{plan.price}€</span>
                  <span className="text-gray-500 text-sm">/mois</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                      <Check size={14} style={{ color: "#D4A017" }} className="shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#demo"
                  className="block text-center py-3.5 text-sm font-black uppercase tracking-wider transition-all"
                  style={
                    plan.highlighted
                      ? { backgroundColor: "#D4A017", color: "#111115" }
                      : { border: "1px solid rgba(212,160,23,0.4)", color: "#D4A017" }
                  }
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="temoignages" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: "#D4A017" }}>
            03 — Témoignages
          </p>
          <h2 className="text-4xl sm:text-5xl font-black uppercase mb-16" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            ILS NOUS<br />FONT CONFIANCE
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ backgroundColor: "rgba(212,160,23,0.15)" }}>
            {testimonials.map((t) => (
              <div key={t.name} className="p-8" style={{ backgroundColor: "#111115" }}>
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-current" style={{ color: "#D4A017" }} />
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-6">"{t.text}"</p>
                <div className="pt-4 border-t" style={{ borderColor: "rgba(212,160,23,0.2)" }}>
                  <p className="font-bold text-sm uppercase">{t.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="demo" className="py-24 px-4" style={{ backgroundColor: "#D4A017" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black uppercase leading-tight" style={{ color: "#111115", fontFamily: "'Arial Black', sans-serif" }}>
            PRÊT À SIMPLIFIER<br />VOS DÉMARCHES ?
          </h2>
          <p className="mt-4 text-sm max-w-lg" style={{ color: "rgba(17,17,21,0.7)" }}>
            Rejoignez plus de 1 200 professionnels qui font confiance à SIVFlow.
          </p>
          <a
            href="#"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 font-black uppercase tracking-wider text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: "#111115", color: "#D4A017" }}
          >
            Réserver une démo gratuite <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t py-12 px-4" style={{ borderColor: "rgba(212,160,23,0.2)" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="text-xl font-black uppercase" style={{ fontFamily: "'Arial Black', sans-serif" }}>
              <span style={{ color: "#D4A017" }}>SIV</span>FLOW
            </p>
            <p className="mt-2 text-xs text-gray-500">Plateforme agréée professionnels auto</p>
          </div>
          <div className="flex flex-wrap gap-8 text-xs uppercase tracking-widest text-gray-500">
            {["Fonctionnalités", "Tarifs", "Mentions légales", "Contact"].map((l) => (
              <a key={l} href="#" className="hover:text-yellow-500 transition-colors">{l}</a>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t text-xs text-gray-700" style={{ borderColor: "rgba(212,160,23,0.1)" }}>
          &copy; {new Date().getFullYear()} SIVFlow. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
