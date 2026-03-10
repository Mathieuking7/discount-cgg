/**
 * DIRECTION 4 — "EDITORIAL TRICOLORE"
 * Concept: Style magazine éditorial français — typographie massive, sections alternées,
 * grille asymétrique. Pense Le Monde x Michelin Guide x La Tribune.
 * Inspirations: The Guardian, Bloomberg Businessweek, Stripe Press
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
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
  Minus,
} from "lucide-react";

// French flag palette — deep blue, crisp white, strong red accent
const BLUE = "#002395";
const RED = "#ED2939";
const CREAM = "#F7F4EF";
const DARK = "#1A1A1A";
const MID = "#3D3D3D";
const GRAY = "#888888";

const features = [
  { icon: Shield, num: "01", title: "Conformité garantie", desc: "Chaque dossier est vérifié automatiquement pour assurer une conformité totale avec la réglementation SIV en vigueur." },
  { icon: Zap, num: "02", title: "Traitement instantané", desc: "Soumettez vos demandes et recevez vos certificats en quelques minutes — sans délai administratif." },
  { icon: FileCheck, num: "03", title: "Suivi en temps réel", desc: "Suivez l'avancement de chaque dossier depuis votre tableau de bord avec des notifications en temps réel." },
  { icon: Users, num: "04", title: "Gestion multi-comptes", desc: "Gérez les accès de votre équipe avec des rôles et permissions granulaires pour chaque collaborateur." },
  { icon: Clock, num: "05", title: "Historique complet", desc: "Accédez à l'intégralité de votre historique de démarches avec archivage sécurisé et recherche avancée." },
  { icon: HeadphonesIcon, num: "06", title: "Support dédié", desc: "Une équipe d'experts SIV disponible pour vous accompagner à chaque étape de vos démarches." },
];

const plans = [
  {
    name: "Starter", price: "59", desc: "Pour les indépendants",
    features: ["50 dossiers / mois", "1 utilisateur", "Support email", "Historique 12 mois"],
    cta: "Commencer", highlighted: false,
  },
  {
    name: "Pro", price: "89", desc: "Pour les équipes",
    features: ["Dossiers illimités", "Utilisateurs illimités", "Support 24/7", "API & intégrations", "Gestionnaire dédié"],
    cta: "Choisir Pro", highlighted: true,
  },
];

const testimonials = [
  { name: "Laurent Mercier", role: "Garage Mercier & Fils", text: "Ce qui prenait des heures se fait maintenant en quelques clics. Un gain de temps considérable pour notre activité.", rating: 5 },
  { name: "Sophie Durand", role: "Auto Prestige Lyon", text: "La fiabilité de la plateforme est remarquable. En deux ans d'utilisation, nous n'avons rencontré aucun problème.", rating: 5 },
  { name: "Marc Lefèvre", role: "FleetCorp — Responsable admin.", text: "Avec plus de 300 véhicules à gérer, SIVFlow est devenu indispensable. La rapidité de traitement est impressionnante.", rating: 5 },
];

export default function DesignV4() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: CREAM, color: DARK }}>

      {/* ── TOP STRIPE — editorial header bar ── */}
      <div className="w-full h-1.5" style={{ background: `linear-gradient(to right, ${BLUE} 33.3%, white 33.3%, white 66.6%, ${RED} 66.6%)` }} />

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: CREAM, borderColor: "#D5D0C8" }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <a href="#" className="flex items-center gap-0">
            <span className="text-2xl font-black tracking-tighter" style={{ color: BLUE, fontFamily: "Georgia, serif" }}>SIV</span>
            <span className="text-2xl font-black tracking-tighter" style={{ color: DARK, fontFamily: "Georgia, serif" }}>Flow</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {["Fonctionnalités", "Tarifs", "Témoignages"].map((l) => (
              <a key={l} href="#" className="text-xs uppercase tracking-[0.12em] font-semibold transition-colors" style={{ color: GRAY }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = DARK)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = GRAY)}>
                {l}
              </a>
            ))}
            <a href="#demo" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition-all hover:opacity-90" style={{ backgroundColor: RED, color: "white" }}>
              Démo <ArrowUpRight size={13} />
            </a>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ color: DARK }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 border-t" style={{ borderColor: "#D5D0C8" }}>
            {["Fonctionnalités", "Tarifs", "Témoignages"].map((l) => (
              <a key={l} href="#" className="block py-2.5 text-xs uppercase tracking-widest font-semibold border-b" style={{ color: MID, borderColor: "#D5D0C8" }}>{l}</a>
            ))}
            <a href="#demo" className="mt-3 block text-center py-2.5 text-xs font-bold uppercase" style={{ backgroundColor: RED, color: "white" }}>
              Réserver une démo
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO — asymmetric editorial ── */}
      <section className="border-b" style={{ borderColor: "#D5D0C8" }}>
        <div className="max-w-7xl mx-auto px-4">
          {/* Top tag line */}
          <div className="flex items-center gap-3 py-4 border-b text-xs uppercase tracking-widest font-semibold" style={{ borderColor: "#D5D0C8", color: GRAY }}>
            <Minus size={12} style={{ color: RED }} />
            Plateforme agréée pour professionnels de l'automobile
            <Minus size={12} style={{ color: RED }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left — huge typographic headline */}
            <div className="lg:col-span-8 py-12 lg:py-20 lg:border-r" style={{ borderColor: "#D5D0C8" }}>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-5xl sm:text-6xl lg:text-8xl font-black leading-none tracking-tighter"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: DARK }}
              >
                L'immatri-
                <br />
                <span style={{ color: BLUE }}>culation</span>
                <br />
                professio-
                <br />
                nelle,
                <br />
                <span style={{ WebkitTextStroke: `2px ${DARK}`, color: "transparent" }}>réinventée.</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row gap-4"
              >
                <a href="#demo" className="inline-flex items-center gap-2 px-6 py-3.5 font-bold text-sm uppercase tracking-wide transition-all hover:opacity-90" style={{ backgroundColor: BLUE, color: "white" }}>
                  Réserver une démo <ArrowRight size={15} />
                </a>
                <a href="#fonctionnalites" className="inline-flex items-center gap-2 px-6 py-3.5 font-bold text-sm uppercase tracking-wide border-2 transition-all" style={{ borderColor: DARK, color: DARK }}>
                  Découvrir
                </a>
              </motion.div>
            </div>

            {/* Right — stats + description */}
            <div className="lg:col-span-4 lg:pl-8 py-12 lg:py-20">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-base leading-relaxed mb-10"
                style={{ color: MID }}
              >
                SIVFlow simplifie vos démarches d'immatriculation. Conçu pour les garages, concessionnaires et professionnels de l'automobile — rapide, fiable, conforme.
              </motion.p>

              <div className="space-y-6">
                {[
                  { value: "1 200+", label: "Professionnels actifs" },
                  { value: "45 000+", label: "Dossiers traités" },
                  { value: "99.8%", label: "Taux de satisfaction" },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    className="flex items-baseline gap-4 pb-6 border-b"
                    style={{ borderColor: "#D5D0C8" }}
                  >
                    <span className="text-4xl font-black" style={{ color: RED, fontFamily: "Georgia, serif" }}>{s.value}</span>
                    <span className="text-xs uppercase tracking-widest" style={{ color: GRAY }}>{s.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES — newspaper column style ── */}
      <section id="fonctionnalites" className="py-16 lg:py-24 border-b" style={{ borderColor: "#D5D0C8" }}>
        <div className="max-w-7xl mx-auto px-4">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-12 pb-4 border-b" style={{ borderColor: "#D5D0C8" }}>
            <span className="text-xs uppercase tracking-[0.25em] font-black px-3 py-1" style={{ backgroundColor: BLUE, color: "white" }}>
              Fonctionnalités
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#D5D0C8" }} />
          </div>

          {/* 2-column editorial grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 2) * 0.1, duration: 0.5 }}
                className="flex gap-6 p-6 border-b border-r-0 lg:border-r"
                style={{
                  borderColor: "#D5D0C8",
                  borderRightColor: i % 2 === 0 ? "#D5D0C8" : "transparent",
                  borderBottomColor: "#D5D0C8",
                }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-black" style={{ color: RED }}>{f.num}</span>
                    <div className="h-px flex-1 w-6" style={{ backgroundColor: "#D5D0C8" }} />
                    <f.icon size={16} style={{ color: BLUE }} />
                  </div>
                  <h3 className="text-lg font-black mb-2 leading-tight" style={{ fontFamily: "Georgia, serif", color: DARK }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: MID }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING — bold contrast section ── */}
      <section id="tarifs" className="py-16 lg:py-24" style={{ backgroundColor: DARK }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-12 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
            <span className="text-xs uppercase tracking-[0.25em] font-black px-3 py-1" style={{ backgroundColor: RED, color: "white" }}>
              Tarifs
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-3xl border" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="p-8 lg:p-10"
                style={{
                  borderRight: i === 0 ? "1px solid rgba(255,255,255,0.15)" : "none",
                  backgroundColor: plan.highlighted ? "rgba(237,41,57,0.08)" : "transparent",
                }}
              >
                {plan.highlighted && (
                  <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: RED }}>— Recommandé</p>
                )}
                <h3 className="text-2xl font-black text-white" style={{ fontFamily: "Georgia, serif" }}>{plan.name}</h3>
                <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">{plan.desc}</p>
                <div className="my-6">
                  <span className="text-5xl font-black text-white">{plan.price}€</span>
                  <span className="text-gray-400 text-sm ml-1">/mois</span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((ft) => (
                    <li key={ft} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <Check size={13} style={{ color: plan.highlighted ? RED : "#888" }} className="shrink-0" />
                      {ft}
                    </li>
                  ))}
                </ul>
                <a href="#demo" className="block text-center py-3 text-sm font-bold uppercase tracking-wide transition-all hover:opacity-90"
                  style={plan.highlighted ? { backgroundColor: RED, color: "white" } : { border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
                  {plan.cta}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — editorial pull quotes ── */}
      <section id="temoignages" className="py-16 lg:py-24 border-y" style={{ borderColor: "#D5D0C8" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-12 pb-4 border-b" style={{ borderColor: "#D5D0C8" }}>
            <span className="text-xs uppercase tracking-[0.25em] font-black px-3 py-1" style={{ backgroundColor: DARK, color: "white" }}>
              Témoignages
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#D5D0C8" }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-l" style={{ borderColor: "#D5D0C8" }}>
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="px-6 py-8 border-r border-b lg:border-b-0"
                style={{ borderColor: "#D5D0C8" }}
              >
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={13} className="fill-current" style={{ color: RED }} />
                  ))}
                </div>
                <blockquote className="text-base font-medium leading-relaxed mb-6" style={{ fontFamily: "Georgia, serif", color: DARK }}>
                  "{t.text}"
                </blockquote>
                <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: "#D5D0C8" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: BLUE }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: DARK }}>{t.name}</p>
                    <p className="text-xs" style={{ color: GRAY }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="demo" className="py-16 lg:py-24" style={{ backgroundColor: BLUE }}>
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-4 mb-10 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.3)" }}>
              <span className="text-xs uppercase tracking-[0.25em] font-black px-3 py-1" style={{ backgroundColor: "white", color: BLUE }}>Démo gratuite</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
            </div>
            <div className="max-w-3xl">
              <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-6" style={{ fontFamily: "Georgia, serif" }}>
                Prêt à simplifier vos démarches ?
              </h2>
              <p className="text-base text-blue-200 mb-8 max-w-lg">
                Rejoignez plus de 1 200 professionnels qui font confiance à SIVFlow pour leurs démarches d'immatriculation.
              </p>
              <a href="#" className="inline-flex items-center gap-2 px-8 py-4 font-bold text-sm uppercase tracking-wide transition-all hover:opacity-90" style={{ backgroundColor: WHITE_COLOR, color: BLUE }}>
                Réserver une démo gratuite <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 border-t" style={{ borderColor: "#D5D0C8" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
            <div>
              <p className="text-xl font-black tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
                <span style={{ color: BLUE }}>SIV</span>Flow
              </p>
              <p className="text-xs mt-1" style={{ color: GRAY }}>Plateforme agréée professionnels auto</p>
            </div>
            <div className="flex flex-wrap gap-8 text-xs uppercase tracking-widest" style={{ color: GRAY }}>
              {["Fonctionnalités", "Tarifs", "Mentions légales", "Contact"].map((l) => (
                <a key={l} href="#" className="hover:underline">{l}</a>
              ))}
            </div>
          </div>
          <div className="pt-6 border-t flex flex-col md:flex-row justify-between text-xs" style={{ borderColor: "#D5D0C8", color: GRAY }}>
            <p>&copy; {new Date().getFullYear()} SIVFlow. Tous droits réservés.</p>
            <div className="mt-2 md:mt-0 flex gap-3 items-center">
              <div className="w-4 h-2.5" style={{ background: `linear-gradient(to right, ${BLUE} 33%, white 33%, white 66%, ${RED} 66%)`, border: "1px solid #ddd" }} />
              <span>Plateforme française</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const WHITE_COLOR = "#FFFFFF";
