import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Car,
  FileText,
  CreditCard,
  Truck,
  ShieldCheck,
  Clock,
  Zap,
  HeadphonesIcon,
  Star,
  ArrowRight,
  FileCheck,
  FilePen,
  MapPin,
  Copy,
  Import,
  Briefcase,
  Users,
  BarChart3,
  Upload,
  Bell,
  Lock,
  Quote,
  BadgeCheck,
  Search,
  PenTool,
  ScrollText,
  Receipt,
  Home,
  Bike,
  XCircle,
  ClipboardList,
  PlusCircle,
  Globe,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import { SimulateurSection } from "@/components/SimulateurSection";
import SEOHead from "@/components/SEOHead";
import SchemaOrg, {
  sivflowOrganizationSchema,
  sivflowWebSiteSchema,
  sivflowServiceSchema,
  sivflowBreadcrumbSchema,
} from "@/components/SchemaOrg";
import { siteConfig } from "@/config/site.config";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const steps = [
  {
    icon: FileText,
    title: "Remplissez le formulaire",
    desc: "Quelques infos sur votre vehicule et c'est parti.",
  },
  {
    icon: CreditCard,
    title: "Payez en ligne",
    desc: "Paiement securise par carte bancaire.",
  },
  {
    icon: ShieldCheck,
    title: "On s'occupe de tout",
    desc: "Notre equipe traite votre dossier sous 24h.",
  },
  {
    icon: Truck,
    title: "Recevez chez vous",
    desc: "Votre carte grise arrive par courrier.",
  },
];

// Visual config per demarche code (icon, color, slug for routing)
const DEMARCHE_VISUAL: Record<string, { icon: any; color: string; bg: string; slug: string }> = {
  CG:                   { icon: FileCheck,    color: "#2563EB", bg: "#EFF6FF", slug: "carte-grise" },
  DC:                   { icon: FilePen,      color: "#7C3AED", bg: "#F5F3FF", slug: "declaration-cession" },
  CHGT_ADRESSE:         { icon: MapPin,       color: "#059669", bg: "#ECFDF5", slug: "changement-adresse" },
  DUPLICATA:            { icon: Copy,         color: "#D97706", bg: "#FFFBEB", slug: "duplicata" },
  CG_NEUF:              { icon: PlusCircle,   color: "#DC2626", bg: "#FEF2F2", slug: "vehicule-neuf" },
  CPI_WW:               { icon: Globe,        color: "#0891B2", bg: "#ECFEFF", slug: "carte-grise-import" },
  FIV:                  { icon: Search,       color: "#4F46E5", bg: "#EEF2FF", slug: "fiv" },
  MODIF_CG:             { icon: PenTool,      color: "#BE185D", bg: "#FDF2F8", slug: "modification-carte-grise" },
  SUCCESSION:           { icon: ScrollText,   color: "#0D9488", bg: "#F0FDFA", slug: "succession" },
  COTITULAIRE:          { icon: Users,        color: "#EA580C", bg: "#FFF7ED", slug: "cotitulaire" },
  QUITUS_FISCAL:        { icon: Receipt,      color: "#7C3AED", bg: "#FAF5FF", slug: "quitus-fiscal" },
  CHGT_ADRESSE_LOCATAIRE: { icon: Home,       color: "#2563EB", bg: "#F0F9FF", slug: "changement-adresse-locataire" },
  IMMAT_CYCLO_ANCIEN:   { icon: Bike,         color: "#65A30D", bg: "#F7FEE7", slug: "immatriculation-cyclomoteur" },
  ANNULER_CPI_WW:       { icon: XCircle,      color: "#E11D48", bg: "#FFF1F2", slug: "annuler-cpi-ww" },
  DEMANDE_IMMAT:        { icon: ClipboardList, color: "#0284C7", bg: "#F0F9FF", slug: "demande-immatriculation" },
  DA:                   { icon: FileCheck,    color: "#0891B2", bg: "#ECFEFF", slug: "declaration-achat" },
};

const demarchesPro = [
  { icon: FileCheck, title: "Declaration d'achat (DA)", desc: "Declarez l'achat d'un vehicule pour votre garage." },
  { icon: FilePen, title: "Declaration de cession (DC)", desc: "Declarez la cession d'un vehicule a un client." },
  { icon: FileCheck, title: "Carte grise", desc: "Changement de titulaire pour vos clients." },
  { icon: Car, title: "WW Provisoire", desc: "Immatriculation provisoire pour vos vehicules." },
  { icon: Briefcase, title: "W Garage", desc: "Plaque W pour vehicules en transit dans votre garage." },
  { icon: ShieldCheck, title: "Quitus fiscal", desc: "Obtenez le quitus fiscal pour vos imports." },
  { icon: Copy, title: "Duplicata CG", desc: "Duplicata de carte grise pour vos clients." },
  { icon: MapPin, title: "Changement d'adresse", desc: "Mise a jour d'adresse pour vos clients." },
  { icon: Import, title: "Carte grise import", desc: "Immatriculation vehicules importes." },
];

const featuresParticulier = [
  { icon: Zap, title: "Traitement rapide", desc: "Votre demarche traitee en moins de 24h ouvrees." },
  { icon: ShieldCheck, title: "100% securise", desc: "Paiement crypte SSL et donnees protegees. Votre securite est notre priorite." },
  { icon: HeadphonesIcon, title: "Support humain", desc: "Une vraie personne vous repond, pas un robot." },
  { icon: CreditCard, title: "Paiement securise", desc: "Payez uniquement pour la demarche demandee." },
  { icon: Clock, title: "Disponible 24/7", desc: "Faites vos demarches quand ca vous arrange." },
  { icon: Truck, title: "Livraison a domicile", desc: "Recevez votre carte grise directement chez vous." },
];

const featuresPro = [
  { icon: BarChart3, title: "Dashboard centralise", desc: "Suivez tous vos dossiers depuis un seul tableau de bord." },
  { icon: Upload, title: "Upload securise", desc: "Vos clients envoient leurs documents en ligne." },
  { icon: CreditCard, title: "Paiement integre", desc: "Encaissez directement, fini les relances." },
  { icon: Bell, title: "Notifications", desc: "Alertes en temps reel pour chaque action client." },
  { icon: Users, title: "Multi-demarches", desc: "Gerez DA, DC, CG et plus depuis un seul espace." },
  { icon: Lock, title: "Donnees protegees", desc: "Chiffrement SSL 256 bits, donnees supprimees apres traitement." },
];

const testimonials = [
  {
    name: "Marie D.",
    role: "Particulier",
    text: "J'avais peur de faire ma carte grise en ligne. Finalement c'etait plus simple qu'a la prefecture !",
    rating: 5,
  },
  {
    name: "Jean-Pierre L.",
    role: "Garage automobile",
    text: "Tres rapide, j'ai recu ma carte grise en 3 jours. Le support m'a aide quand j'avais une question.",
    rating: 5,
  },
  {
    name: "Sophie M.",
    role: "Particulier",
    text: "Demarche rapide et efficace. J'ai fait mon changement d'adresse en 5 minutes, tout etait clair.",
    rating: 5,
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [demarchesParticulier, setDemarchesParticulier] = useState<Array<{
    code: string; slug: string; title: string; desc: string;
    icon: any; color: string; bg: string;
  }>>([]);

  useEffect(() => {
    supabase
      .from("guest_demarche_types")
      .select("code, titre, description, ordre")
      .eq("actif", true)
      .order("ordre")
      .then(({ data }) => {
        if (!data) return;
        setDemarchesParticulier(
          data
            .map((d) => {
              const visual = DEMARCHE_VISUAL[d.code];
              if (!visual) return null;
              return {
                code: d.code,
                slug: visual.slug,
                title: d.titre,
                desc: d.description || "",
                icon: visual.icon,
                color: visual.color,
                bg: visual.bg,
              };
            })
            .filter(Boolean) as any[]
        );
      });
  }, []);

  return (
    <div className="min-h-screen font-sans bg-white">
      <SEOHead
        title={siteConfig.seo.defaultTitle}
        description={siteConfig.seo.defaultDescription}
        canonicalUrl={`${siteConfig.baseUrl}/`}
      />
      <SchemaOrg
        schema={[
          sivflowOrganizationSchema,
          sivflowWebSiteSchema,
          sivflowServiceSchema,
          sivflowBreadcrumbSchema([
            { name: "Accueil", url: "https://sivflow.fr/" },
          ]),
        ]}
      />

      {/* Tricolor bar */}
      <div className="h-1.5 flex">
        <div className="flex-1 bg-[#002395]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#ED2939]" />
      </div>

      <Navbar />

      {/* Trust Bar */}
      <div className="bg-[#1B2A4A] text-white/80 py-2.5 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-6 text-xs">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} aria-hidden="true" /> Paiement 100% securise
          </span>
          <span className="hidden sm:inline text-white/30">|</span>
          <span className="hidden sm:flex items-center gap-1.5">
            <BadgeCheck size={14} aria-hidden="true" /> Traitement sous 24h
          </span>
          <span className="hidden sm:inline text-white/30">|</span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Star size={14} className="fill-amber-400 text-amber-400" /> 4.8/5 sur 4 839 avis
          </span>
        </div>
      </div>

      {/* ── 01. HERO ── Simulateur-first approach */}
      <section id="main-content" className="px-4 pt-12 pb-20 bg-gradient-to-b from-[#F0F4F8] to-white">
        <div className="max-w-6xl mx-auto text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-[#1A1A1A] leading-[1.1] mb-4"
          >
            Votre <span className="text-[#002395]">carte grise</span> en ligne
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[#1A1A1A]/60 text-lg max-w-xl mx-auto"
          >
            Service rapide, securise et fiable. Calculez le prix de votre carte grise instantanement.
          </motion.p>
        </div>

        <SimulateurSection />

        {/* Social proof counters */}
        <motion.div
          className="max-w-xl mx-auto mt-8 flex items-center justify-center gap-8 text-sm text-[#1A1A1A]/70"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1A1A1A]">12 847</div>
            <div>demarches traitees</div>
          </div>
          <div className="w-px h-8 bg-[#1A1A1A]/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1A1A1A]">4.8/5</div>
            <div>satisfaction client</div>
          </div>
          <div className="w-px h-8 bg-[#1A1A1A]/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1A1A1A]">24h</div>
            <div>traitement moyen</div>
          </div>
        </motion.div>
      </section>

      {/* ── 02. DEMARCHES PARTICULIER ── Horizontal scroll carousel */}
      <section id="demarches-particulier" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              className="text-2xl md:text-4xl font-serif font-bold text-[#1A1A1A]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              Toutes nos demarches
            </motion.h2>
            <motion.p
              className="text-[#1A1A1A]/60 mt-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
            >
              Choisissez votre demarche et laissez-vous guider
            </motion.p>
          </div>

          {/* Grid of demarches */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {demarchesParticulier.map((d, i) => (
              <button
                key={d.slug}
                onClick={() => navigate(`/demarches/${d.slug}`)}
                className="group flex flex-col items-center text-center p-5 hover:bg-white border border-transparent hover:shadow-lg rounded-2xl transition-all"
                style={{ backgroundColor: d.bg }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${d.color}18` }}
                >
                  <d.icon size={22} style={{ color: d.color }} />
                </div>
                <h3 className="font-semibold text-[#1A1A1A] text-sm leading-tight mb-1">
                  {d.title}
                </h3>
                <p className="text-[11px] text-[#1A1A1A]/70 leading-snug line-clamp-2">{d.desc}</p>
                <div
                  className="mt-3 text-[10px] font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition flex items-center gap-1"
                  style={{ color: d.color }}
                >
                  Commencer <ArrowRight size={12} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03. COMMENT CA MARCHE ── Horizontal cards */}
      <section id="fonctionnement" className="px-4 py-20 bg-[#F7F4EF]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              className="text-2xl md:text-4xl font-serif font-bold text-[#1A1A1A]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              Comment ca marche ?
            </motion.h2>
            <motion.p
              className="text-[#1A1A1A]/60 mt-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
            >
              4 etapes simples pour obtenir votre carte grise
            </motion.p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="relative p-6 bg-white rounded-2xl border border-gray-200"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <div className="w-10 h-10 rounded-full bg-[#002395] text-white flex items-center justify-center font-bold text-sm mb-4">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <step.icon size={24} className="text-[#002395] mb-3" />
                <h3 className="font-semibold text-[#1A1A1A] mb-1">{step.title}</h3>
                <p className="text-sm text-[#1A1A1A]/60">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04. AVANTAGES ── bleu-france dark bg with icon cards */}
      <section id="features" className="px-4 py-20 bg-[#002395]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              className="text-2xl md:text-4xl font-serif font-bold text-white"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              Pourquoi {siteConfig.siteName} ?
            </motion.h2>
            <motion.p
              className="text-white/80 mt-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
            >
              Un service fiable, rapide et conforme
            </motion.p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuresParticulier.map((f, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <f.icon size={24} className="text-white/80 mb-4" />
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/80 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 05. ESPACE PRO ── Editorial layout */}
      <section id="espace-pro" className="px-4 py-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-4xl font-serif font-bold text-[#1A1A1A]">
              La plateforme SIV des pros de l'auto
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-[#1A1A1A]/60 mt-3 max-w-xl">
              Gerez toutes vos demarches SIV depuis un seul espace. Dashboard, paiements, documents — tout est centralise.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            <div className="md:col-span-6">
              <h3 className="text-sm font-semibold text-[#1A1A1A]/70 uppercase tracking-wider mb-6">Demarches disponibles</h3>
              <div className="divide-y divide-[#1A1A1A]/10">
                {demarchesPro.map((d, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-4 py-4"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i * 0.5}
                    variants={fadeUp}
                  >
                    <d.icon size={18} className="text-[#002395] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-[#1A1A1A]">{d.title}</h4>
                      <p className="text-xs text-[#1A1A1A]/70 mt-0.5">{d.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="md:col-span-6">
              <h3 className="text-sm font-semibold text-[#1A1A1A]/70 uppercase tracking-wider mb-6">Vos outils</h3>
              <div className="divide-y divide-[#1A1A1A]/10">
                {featuresPro.map((f, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-4 py-4"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i * 0.5}
                    variants={fadeUp}
                  >
                    <f.icon size={18} className="text-[#002395] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-[#1A1A1A]">{f.title}</h4>
                      <p className="text-xs text-[#1A1A1A]/70 mt-0.5">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-[#1A1A1A]/10 pt-10 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="bg-[#1A1A1A] text-white px-8 py-4 font-medium hover:bg-[#1A1A1A]/90 transition inline-flex items-center gap-2 rounded-xl"
            >
              Creer mon espace pro <ArrowRight size={16} />
            </button>
            <p className="text-xs text-[#1A1A1A]/70">
              Paiement a la demarche. Pas d'abonnement, pas d'engagement.
            </p>
          </div>
        </div>
      </section>

      {/* ── 06. TEMOIGNAGES ── Serif blockquotes with star ratings */}
      <section id="avis" className="px-4 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              className="text-2xl md:text-4xl font-serif font-bold text-[#1A1A1A]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              Ce que disent nos utilisateurs
            </motion.h2>
            <motion.div
              className="flex items-center justify-center gap-1 mt-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
            >
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} size={20} className="fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2 text-sm text-[#1A1A1A]/60 font-medium">4.8/5 sur 4 839 avis</span>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className="p-6 bg-neutral-50 rounded-2xl border border-gray-200"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote size={20} className="text-[#002395]/20 mb-3" />
                <blockquote className="font-serif text-lg text-[#1A1A1A] leading-relaxed mb-6">
                  "{t.text}"
                </blockquote>
                <div className="border-t border-[#1A1A1A]/10 pt-4">
                  <span className="text-sm font-semibold text-[#1A1A1A] block">{t.name}</span>
                  <span className="text-xs text-[#1A1A1A]/70">{t.role}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 07. FAQ ── */}
      <FAQ />

      {/* ── 08. CTA FINAL ── encre dark bg */}
      <section className="px-4 py-20 bg-[#1A1A1A]">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-4xl font-serif font-bold text-white mb-4">
            Pret a simplifier vos demarches ?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-white/80 mb-10 max-w-md mx-auto">
            Particulier ou professionnel, commencez votre demarche en quelques clics.
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/simulateur")}
              className="bg-white text-[#1A1A1A] px-8 py-4 font-medium hover:bg-white/90 transition inline-flex items-center justify-center gap-2 rounded-xl"
            >
              Commencer ma demarche <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-transparent text-white px-8 py-4 font-medium hover:bg-white/10 transition border border-white/20 inline-flex items-center justify-center gap-2 rounded-xl"
            >
              <Briefcase size={16} /> Espace professionnel
            </button>
          </motion.div>
          <motion.p variants={fadeUp} custom={3} className="mt-6 text-white/50 text-sm">
            💳 Paiement en 4x disponible <span className="text-white/80 font-medium">(Sur demande)</span>
          </motion.p>
          <div className="mt-16 h-0.5 flex max-w-xs mx-auto">
            <div className="flex-1 bg-[#002395]" />
            <div className="flex-1 bg-white/20" />
            <div className="flex-1 bg-[#ED2939]" />
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
