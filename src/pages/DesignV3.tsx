/**
 * DIRECTION 3 — "TABLEAU DE BORD EN DIRECT"
 * Concept: La landing page IS the dashboard. Visitors see the tool before signing up.
 * Inspirations: Linear.app, Vercel dashboard, Retool
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  FileCheck,
  Users,
  Clock,
  BarChart2,
  Check,
  TrendingUp,
  ArrowRight,
  Menu,
  X,
  Circle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const mockDossiers = [
  { id: "FR-2024-8841", type: "Immatriculation", status: "done", time: "2 min" },
  { id: "FR-2024-8840", type: "Transfert propriété", status: "processing", time: "En cours..." },
  { id: "FR-2024-8839", type: "Changement adresse", status: "done", time: "4 min" },
  { id: "FR-2024-8838", type: "Duplicata CG", status: "done", time: "1 min" },
  { id: "FR-2024-8837", type: "Immatriculation", status: "pending", time: "En attente" },
];

const features = [
  { icon: Shield, title: "Conformité garantie", desc: "Vérification automatique de la conformité SIV sur chaque dossier soumis." },
  { icon: Zap, title: "Traitement en minutes", desc: "Délai moyen de traitement : 3 minutes. Résultats instantanés." },
  { icon: FileCheck, title: "Suivi en temps réel", desc: "Tableau de bord live avec statut précis de chaque démarche." },
  { icon: Users, title: "Gestion d'équipe", desc: "Rôles, permissions et logs d'activité pour toute votre équipe." },
  { icon: Clock, title: "Historique complet", desc: "Archivage sécurisé avec recherche avancée sur toutes vos démarches." },
  { icon: BarChart2, title: "Statistiques détaillées", desc: "Suivi de vos volumes, délais et performances en un coup d'oeil." },
];

const plans = [
  {
    name: "Starter", price: "59", desc: "Indépendants",
    features: ["50 dossiers / mois", "1 utilisateur", "Support email", "Historique 12 mois"],
    cta: "Démarrer", highlighted: false,
  },
  {
    name: "Pro", price: "89", desc: "Équipes & garages",
    features: ["Dossiers illimités", "Utilisateurs illimités", "Support 24/7", "API complète", "Gestionnaire dédié"],
    cta: "Passer Pro", highlighted: true,
  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "done") return (
    <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#22C55E" }}>
      <CheckCircle2 size={13} /> Traité
    </span>
  );
  if (status === "processing") return (
    <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#3B82F6" }}>
      <RefreshCw size={13} className="animate-spin" /> En cours
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#F59E0B" }}>
      <AlertCircle size={13} /> En attente
    </span>
  );
}

function LiveCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const step = Math.ceil(target / 40);
    const interval = setInterval(() => {
      setCount((c) => {
        if (c + step >= target) { clearInterval(interval); return target; }
        return c + step;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [target]);
  return <span>{count.toLocaleString("fr-FR")}{suffix}</span>;
}

const BG = "#0A0A0F";
const SURFACE = "#12121A";
const BORDER = "#1E1E2E";
const ACCENT = "#6366F1";

export default function DesignV3() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDossier, setActiveDossier] = useState(1);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveDossier((prev) => (prev + 1) % mockDossiers.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: BG, color: "#E2E8F0" }}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ backgroundColor: "rgba(10,10,15,0.95)", borderColor: BORDER, backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-12">
          <a href="#" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
              <span className="text-white text-xs font-black">S</span>
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">SIVFlow</span>
            <span className="ml-1 px-1.5 py-0.5 text-xs font-medium rounded" style={{ backgroundColor: "rgba(99,102,241,0.15)", color: ACCENT }}>Pro</span>
          </a>
          <div className="hidden md:flex items-center gap-6">
            {["Fonctionnalités", "Tarifs", "Témoignages"].map((l) => (
              <a key={l} href="#" className="text-xs text-gray-400 hover:text-white transition-colors">{l}</a>
            ))}
            <a href="#demo" className="px-3 py-1.5 text-xs font-medium rounded transition-all hover:opacity-90" style={{ backgroundColor: ACCENT, color: "white" }}>
              Démarrer gratuitement
            </a>
          </div>
          <button className="md:hidden text-gray-400" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 border-t" style={{ borderColor: BORDER }}>
            {["Fonctionnalités", "Tarifs", "Témoignages"].map((l) => (
              <a key={l} href="#" className="block py-2 text-xs text-gray-400">{l}</a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO — looks like a real dashboard */}
      <section className="pt-12 px-4 pb-0">
        <div className="max-w-7xl mx-auto pt-16 pb-0">
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs mb-6"
              style={{ borderColor: "rgba(99,102,241,0.3)", color: "#A5B4FC", backgroundColor: "rgba(99,102,241,0.08)" }}
            >
              <Circle size={6} className="fill-current text-green-400" />
              Plateforme opérationnelle — 99.8% de disponibilité
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white"
            >
              Vos démarches SIV<br /><span style={{ color: ACCENT }}>en temps réel</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-4 text-sm text-gray-400 max-w-lg mx-auto"
            >
              La seule plateforme qui vous montre exactement où en est chaque dossier — en direct.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <a href="#demo" className="inline-flex items-center gap-2 px-6 py-2.5 font-medium text-sm rounded transition-all hover:opacity-90" style={{ backgroundColor: ACCENT, color: "white" }}>
                Essai gratuit 14 jours <ArrowRight size={15} />
              </a>
            </motion.div>
          </div>

          {/* Dashboard preview window */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="rounded-t-xl border overflow-hidden"
            style={{ borderColor: BORDER, backgroundColor: SURFACE }}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: BORDER, backgroundColor: "rgba(0,0,0,0.3)" }}>
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <div className="ml-4 flex-1 max-w-sm mx-auto">
                <div className="rounded px-3 py-1 text-xs text-center text-gray-500" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
                  app.sivflow.fr/dashboard
                </div>
              </div>
            </div>
            <div className="p-4 lg:p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Dossiers aujourd'hui", value: 24, suffix: "", icon: FileCheck },
                  { label: "En traitement", value: 3, suffix: "", icon: RefreshCw },
                  { label: "Délai moyen", value: 3, suffix: " min", icon: Clock },
                  { label: "Ce mois", value: 312, suffix: "", icon: TrendingUp },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg p-3 border" style={{ borderColor: BORDER, backgroundColor: "rgba(0,0,0,0.3)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{stat.label}</span>
                      <stat.icon size={13} className="text-gray-600" />
                    </div>
                    <p className="text-xl font-bold text-white">
                      <LiveCounter target={stat.value} suffix={stat.suffix} />
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border overflow-hidden" style={{ borderColor: BORDER }}>
                <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: BORDER, backgroundColor: "rgba(0,0,0,0.2)" }}>
                  <span className="text-xs font-medium text-gray-400">Dossiers en cours</span>
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: "#22C55E" }}>
                    <Circle size={6} className="fill-current animate-pulse" /> Live
                  </span>
                </div>
                {mockDossiers.map((d, i) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-4 px-4 py-2.5 text-xs border-b last:border-b-0 transition-colors"
                    style={{ borderColor: BORDER, backgroundColor: i === activeDossier ? "rgba(99,102,241,0.05)" : "transparent" }}
                  >
                    <span className="font-mono text-gray-500 hidden sm:block">{d.id}</span>
                    <span className="text-gray-300 flex-1">{d.type}</span>
                    <StatusBadge status={d.status} />
                    <span className="text-gray-600 hidden md:block">{d.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12">
            <p className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: ACCENT }}>Fonctionnalités</p>
            <h2 className="text-3xl font-bold text-white">Conçu pour les pros</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="p-5 rounded-lg border transition-all hover:border-indigo-500/30"
                style={{ borderColor: BORDER, backgroundColor: SURFACE }}
              >
                <div className="w-8 h-8 rounded flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(99,102,241,0.1)", color: ACCENT }}>
                  <f.icon size={16} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="tarifs" className="py-24 px-4" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12">
            <p className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: ACCENT }}>Tarifs</p>
            <h2 className="text-3xl font-bold text-white">Simple et transparent</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-lg border p-6 relative"
                style={{ borderColor: plan.highlighted ? ACCENT : BORDER, backgroundColor: plan.highlighted ? "rgba(99,102,241,0.06)" : SURFACE }}
              >
                {plan.highlighted && (
                  <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: ACCENT, color: "white" }}>
                    Recommandé
                  </span>
                )}
                <h3 className="text-sm font-semibold text-white">{plan.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{plan.desc}</p>
                <div className="my-4">
                  <span className="text-3xl font-bold text-white">{plan.price}€</span>
                  <span className="text-xs text-gray-500 ml-1">/mois</span>
                </div>
                <ul className="space-y-2 mb-5">
                  {plan.features.map((ft) => (
                    <li key={ft} className="flex items-center gap-2 text-xs text-gray-400">
                      <Check size={12} style={{ color: ACCENT }} className="shrink-0" />
                      {ft}
                    </li>
                  ))}
                </ul>
                <a href="#demo" className="block text-center py-2.5 text-xs font-medium rounded transition-all hover:opacity-90"
                  style={plan.highlighted ? { backgroundColor: ACCENT, color: "white" } : { border: `1px solid ${BORDER}`, color: "white" }}>
                  {plan.cta}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="demo" className="py-24 px-4" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="rounded-xl border p-8 lg:p-12 text-center"
            style={{ borderColor: "rgba(99,102,241,0.3)", backgroundColor: SURFACE }}
          >
            <h2 className="text-3xl font-bold text-white mb-3">Essai gratuit 14 jours</h2>
            <p className="text-sm text-gray-400 mb-8">Aucune carte bancaire requise. Accès complet à toutes les fonctionnalités Pro.</p>
            <a href="#" className="inline-flex items-center gap-2 px-6 py-3 font-medium text-sm rounded transition-all hover:opacity-90" style={{ backgroundColor: ACCENT, color: "white" }}>
              Commencer gratuitement <ArrowRight size={15} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-8 px-4" style={{ borderColor: BORDER }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between gap-4 items-center">
          <span className="text-sm font-semibold text-white">SIVFlow</span>
          <div className="flex gap-6 text-xs text-gray-500">
            {["Mentions légales", "Confidentialité", "CGV", "Contact"].map((l) => (
              <a key={l} href="#" className="hover:text-gray-300 transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} SIVFlow</p>
        </div>
      </footer>
    </div>
  );
}
