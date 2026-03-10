/**
 * DIRECTION 5 — "GRADIENT ATLAS"
 * Concept: Bold gradient backgrounds that shift between sections — chaque section
 * a sa propre identité chromatique. Zero card design, typographie XXL.
 * Inspirations: Stripe, Notion, Loom, Pitch.com
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
  Menu,
  X,
  MoveRight,
} from "lucide-react";

const features = [
  { icon: Shield, title: "Conformité garantie", desc: "Chaque dossier est vérifié automatiquement pour assurer une conformité totale avec la réglementation SIV." },
  { icon: Zap, title: "Traitement instantané", desc: "Soumettez vos demandes et recevez vos certificats en quelques minutes, sans délai administratif." },
  { icon: FileCheck, title: "Suivi en temps réel", desc: "Tableau de bord live avec statut précis de chaque démarche." },
  { icon: Users, title: "Gestion d'équipe", desc: "Rôles et permissions granulaires pour chaque collaborateur." },
  { icon: Clock, title: "Historique complet", desc: "Archivage sécurisé avec recherche avancée sur toutes vos démarches." },
  { icon: HeadphonesIcon, title: "Support expert", desc: "Experts SIV disponibles pour vous accompagner à chaque étape." },
];

const plans = [
  {
    name: "Starter", price: "59", desc: "Pour les indépendants et petites structures",
    features: ["50 dossiers / mois", "1 utilisateur", "Support email", "Historique 12 mois"],
    cta: "Commencer", highlighted: false,
  },
  {
    name: "Pro", price: "89", desc: "Pour les équipes et garages exigeants",
    features: ["Dossiers illimités", "Utilisateurs illimités", "Support 24/7", "API & intégrations", "Gestionnaire dédié"],
    cta: "Choisir Pro", highlighted: true,
  },
];

const testimonials = [
  { name: "Laurent Mercier", role: "Garage Mercier & Fils", text: "Ce qui prenait des heures se fait maintenant en quelques clics. Un gain de temps considérable.", rating: 5 },
  { name: "Sophie Durand", role: "Auto Prestige Lyon", text: "La fiabilité est remarquable. En deux ans, aucun problème. Le support est exemplaire.", rating: 5 },
  { name: "Marc Lefèvre", role: "FleetCorp — 300 véhicules", text: "Interface intuitive et traitement d'une rapidité impressionnante. Indispensable.", rating: 5 },
];

export default function DesignV5() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden">

      {/* ── NAV — transparent over gradient ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{ backdropFilter: "blur(20px)", backgroundColor: "rgba(10, 15, 40, 0.7)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <a href="#" className="text-xl font-bold tracking-tight text-white">
            SIV<span style={{ color: "#7EE8A2" }}>Flow</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {["Fonctionnalités", "Tarifs", "Témoignages"].map((l) => (
              <a key={l} href="#" className="text-xs font-medium text-white/60 hover:text-white transition-colors">{l}</a>
            ))}
            <a href="#demo" className="px-4 py-2 text-xs font-semibold rounded-full text-white border border-white/20 hover:bg-white/10 transition-all">
              Réserver une démo
            </a>
          </div>
          <button className="md:hidden text-white/70" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 border-t border-white/10">
            {["Fonctionnalités", "Tarifs", "Témoignages"].map((l) => (
              <a key={l} href="#" className="block py-2 text-sm text-white/60">{l}</a>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO — deep blue-to-teal gradient ── */}
      <section
        className="relative pt-14 min-h-screen flex items-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0A0F28 0%, #0D1B45 30%, #0E2B55 55%, #0A3A5C 75%, #083545 100%)",
        }}
      >
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #3B82F6, transparent)", top: "10%", right: "5%", filter: "blur(60px)" }} />
          <div className="absolute w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #06B6D4, transparent)", bottom: "20%", left: "10%", filter: "blur(80px)" }} />
          <div className="absolute w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7EE8A2, transparent)", top: "40%", right: "25%", filter: "blur(60px)" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-32 text-white w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{ backgroundColor: "rgba(126,232,162,0.15)", color: "#7EE8A2", border: "1px solid rgba(126,232,162,0.25)" }}
          >
            Agréé professionnels de l'automobile
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-none tracking-tight"
          >
            Vos démarches
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #7EE8A2 0%, #06B6D4 50%, #3B82F6 100%)" }}
            >
              SIV simplifiées.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 text-lg text-white/60 max-w-xl leading-relaxed"
          >
            La plateforme professionnelle d'immatriculation conçue pour les garages et concessionnaires. Rapide, fiable, conforme — sans compromis.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 font-semibold text-sm rounded-full text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #3B82F6, #06B6D4)" }}
            >
              Réserver une démo <ArrowRight size={16} />
            </a>
            <a
              href="#fonctionnalites"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 font-semibold text-sm rounded-full transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}
            >
              Voir les fonctionnalités <MoveRight size={16} />
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-16 flex flex-wrap gap-10"
          >
            {[
              { v: "1 200+", l: "Professionnels actifs" },
              { v: "45 000+", l: "Dossiers traités" },
              { v: "99.8%", l: "Satisfaction client" },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-3xl font-bold" style={{ color: "#7EE8A2" }}>{s.v}</p>
                <p className="text-xs text-white/40 uppercase tracking-wide mt-1">{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES — warm off-white section, no cards ── */}
      <section
        id="fonctionnalites"
        className="py-24 lg:py-36"
        style={{ backgroundColor: "#F8F7F4" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16 lg:mb-24">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-4" style={{ color: "#3B82F6" }}>Fonctionnalités</p>
            <h2 className="text-4xl lg:text-6xl font-bold leading-tight tracking-tight" style={{ color: "#0A0F28" }}>
              Tout ce dont vous<br />avez besoin.
            </h2>
          </motion.div>

          {/* Feature list — no cards, just horizontal dividers */}
          <div>
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="flex items-start gap-6 lg:gap-10 py-7 border-b group"
                style={{ borderColor: "#E8E4DC" }}
              >
                <div className="flex items-center gap-4 w-10 shrink-0">
                  <f.icon size={20} style={{ color: "#3B82F6" }} />
                </div>
                <h3 className="text-lg font-semibold w-48 shrink-0" style={{ color: "#0A0F28" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "#6B7280" }}>{f.desc}</p>
                <ArrowRight size={16} className="shrink-0 mt-1 transition-transform group-hover:translate-x-1" style={{ color: "#D1D5DB" }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING — vibrant gradient section ── */}
      <section
        id="tarifs"
        className="py-24 lg:py-36 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 30%, #3730A3 60%, #2D3A8C 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #818CF8, transparent)", top: "-5%", right: "10%", filter: "blur(80px)" }} />
          <div className="absolute w-64 h-64 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #A78BFA, transparent)", bottom: "10%", left: "5%", filter: "blur(60px)" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-4" style={{ color: "#A5B4FC" }}>Tarifs</p>
            <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Des offres claires.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-2xl p-7 relative"
                style={{
                  backgroundColor: plan.highlighted ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                  border: plan.highlighted ? "1px solid rgba(165,180,252,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                {plan.highlighted && (
                  <span
                    className="absolute -top-3 left-5 px-3 py-0.5 text-xs font-semibold rounded-full"
                    style={{ background: "linear-gradient(90deg, #818CF8, #A78BFA)", color: "white" }}
                  >
                    Recommandé
                  </span>
                )}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-white/40 mt-0.5">{plan.desc}</p>
                <div className="my-5">
                  <span className="text-4xl font-bold text-white">{plan.price}€</span>
                  <span className="text-xs text-white/40 ml-1">/mois</span>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((ft) => (
                    <li key={ft} className="flex items-center gap-2.5 text-sm text-white/70">
                      <Check size={13} style={{ color: "#A5B4FC" }} className="shrink-0" />
                      {ft}
                    </li>
                  ))}
                </ul>
                <a
                  href="#demo"
                  className="block text-center py-3 text-sm font-semibold rounded-xl transition-all hover:opacity-90"
                  style={plan.highlighted
                    ? { background: "linear-gradient(135deg, #818CF8, #A78BFA)", color: "white" }
                    : { border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)" }}
                >
                  {plan.cta}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — clean white ── */}
      <section id="temoignages" className="py-24 lg:py-36" style={{ backgroundColor: "white" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-4" style={{ color: "#3B82F6" }}>Témoignages</p>
            <h2 className="text-4xl lg:text-6xl font-bold leading-tight tracking-tight" style={{ color: "#0A0F28" }}>
              Ils nous font confiance.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="flex flex-col"
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-current" style={{ color: "#F59E0B" }} />
                  ))}
                </div>
                <p className="text-base leading-relaxed flex-1 mb-6" style={{ color: "#374151" }}>"{t.text}"</p>
                <div className="flex items-center gap-3 pt-5 border-t" style={{ borderColor: "#F3F4F6" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #3B82F6, #06B6D4)" }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#111827" }}>{t.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — emerald gradient ── */}
      <section
        id="demo"
        className="py-24 lg:py-36 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #064E3B 0%, #065F46 40%, #047857 70%, #059669 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #34D399, transparent)", bottom: "-10%", right: "5%", filter: "blur(80px)" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
              Prêt à simplifier<br />vos démarches ?
            </h2>
            <p className="text-base max-w-lg mb-10" style={{ color: "rgba(255,255,255,0.65)" }}>
              Rejoignez plus de 1 200 professionnels qui font confiance à SIVFlow pour leurs démarches d'immatriculation.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-sm rounded-full transition-all hover:opacity-90"
              style={{ backgroundColor: "white", color: "#065F46" }}
            >
              Réserver une démo gratuite <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 border-t" style={{ backgroundColor: "#0A0F28", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between gap-6 items-center">
          <span className="text-lg font-bold text-white">
            SIV<span style={{ color: "#7EE8A2" }}>Flow</span>
          </span>
          <div className="flex flex-wrap gap-6 text-xs text-white/30">
            {["Fonctionnalités", "Tarifs", "Mentions légales", "Contact"].map((l) => (
              <a key={l} href="#" className="hover:text-white/70 transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-xs text-white/20">&copy; {new Date().getFullYear()} SIVFlow</p>
        </div>
      </footer>
    </div>
  );
}
