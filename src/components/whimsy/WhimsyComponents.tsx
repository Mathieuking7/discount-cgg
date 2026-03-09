/**
 * SIVFlow Whimsy Components
 * Composants de delight pour une experience agreeable et chaleureuse
 * Usage : import { ... } from "@/components/whimsy/WhimsyComponents"
 */

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useEffect, useState, useMemo } from "react";
import { CheckCircle, FileText, Sparkles, Clock, Loader2, PartyPopper, Rocket } from "lucide-react";

// ============================================================
// 1. ONBOARDING - Animation de bienvenue
// ============================================================

interface WelcomeAnimationProps {
  userName: string;
  onComplete?: () => void;
}

export function WelcomeAnimation({ userName, onComplete }: WelcomeAnimationProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1400),
      setTimeout(() => {
        setStep(3);
        onComplete?.();
      }, 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {step < 3 && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#1E3A8A] to-[#2563EB]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center text-white space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
            >
              <Rocket className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={step >= 1 ? { opacity: 1, y: 0 } : {}}
              className="text-3xl font-bold"
            >
              Bienvenue, {userName} !
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={step >= 2 ? { opacity: 1, y: 0 } : {}}
              className="text-lg text-blue-100 max-w-md"
            >
              Votre espace pro est pret. Vos demarches vont devenir un jeu d'enfant.
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// 1b. ONBOARDING - Messages encourageants profil
// ============================================================

interface ProfileEncouragementProps {
  filledFields: number;
  totalFields: number;
}

export function ProfileEncouragement({ filledFields, totalFields }: ProfileEncouragementProps) {
  const progress = Math.round((filledFields / totalFields) * 100);

  const message = useMemo(() => {
    if (progress === 0) return "C'est parti ! Quelques infos et vous etes operationnel.";
    if (progress < 40) return "Bon debut ! Continuez comme ca.";
    if (progress < 70) return "Deja bien avance, plus que quelques champs.";
    if (progress < 100) return "Presque termine ! Le fil d'arrivee est en vue.";
    return "Parfait, votre profil est complet !";
  }, [progress]);

  return (
    <motion.div
      key={message}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 text-sm text-muted-foreground py-2"
    >
      <div className="relative h-2 flex-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs whitespace-nowrap font-medium">{message}</span>
    </motion.div>
  );
}

// ============================================================
// 1c. ONBOARDING - Celebration profil complet
// ============================================================

interface ProfileCompleteCelebrationProps {
  show: boolean;
  onDismiss?: () => void;
}

export function ProfileCompleteCelebration({ show, onDismiss }: ProfileCompleteCelebrationProps) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(() => onDismiss?.(), 4000);
      return () => clearTimeout(t);
    }
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-xl border border-[#0D9488]/20 p-5 max-w-xs"
        >
          <div className="flex items-start gap-3">
            <motion.div
              initial={{ rotate: -20 }}
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.6 }}
              className="text-2xl flex-shrink-0"
            >
              <PartyPopper className="w-6 h-6 text-[#EAB308]" />
            </motion.div>
            <div>
              <p className="font-semibold text-sm text-gray-900">Profil complet !</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tout est en ordre. Vous pouvez lancer votre premiere demarche.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// 2. DASHBOARD - Salutation personnalisee
// ============================================================

interface GreetingProps {
  userName: string;
  className?: string;
}

export function PersonalizedGreeting({ userName, className }: GreetingProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon apres-midi";
    return "Bonsoir";
  }, []);

  const subtitle = useMemo(() => {
    const day = new Date().getDay();
    if (day === 1) return "Bonne reprise !";
    if (day === 5) return "Derniere ligne droite avant le week-end !";
    return "Que peut-on faire pour vous aujourd'hui ?";
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <h2 className="text-2xl font-bold text-gray-900">
        {greeting}, {userName}
      </h2>
      <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
    </motion.div>
  );
}

// ============================================================
// 2b. DASHBOARD - Stats animees
// ============================================================

interface AnimatedStatProps {
  label: string;
  value: number;
  icon: ReactNode;
  color?: string;
  delay?: number;
}

export function AnimatedStat({ label, value, icon, color = "text-[#1E3A8A]", delay = 0 }: AnimatedStatProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 800;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayed(Math.round(eased * value));
      if (progress >= 1) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-3"
    >
      <div className={`${color} opacity-70`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold tabular-nums">{displayed}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}

// ============================================================
// 2c. DASHBOARD - Empty state engageant
// ============================================================

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EngagingEmptyState({
  title = "Aucune demarche pour le moment",
  description = "C'est calme ici... Lancez votre premiere demarche en quelques clics.",
  actionLabel = "Nouvelle demarche",
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 px-6"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto w-16 h-16 bg-gradient-to-br from-[#1E3A8A]/10 to-[#0D9488]/10 rounded-2xl flex items-center justify-center mb-4"
      >
        <FileText className="w-8 h-8 text-[#1E3A8A]/50" />
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">{description}</p>
      {onAction && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className="mt-6 px-5 py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white text-sm font-medium rounded-lg shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-shadow"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}

// ============================================================
// 3. DEMARCHES - Progress indicator engageant
// ============================================================

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export function EngagingStepProgress({ currentStep, totalSteps, stepLabels }: StepProgressProps) {
  const progress = ((currentStep) / totalSteps) * 100;

  const encouragement = useMemo(() => {
    const ratio = currentStep / totalSteps;
    if (ratio === 0) return "C'est parti !";
    if (ratio < 0.5) return "Vous avancez bien";
    if (ratio < 1) return "Presque fini !";
    return "Termine !";
  }, [currentStep, totalSteps]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">
          Etape {currentStep + 1} sur {totalSteps}
          {stepLabels?.[currentStep] && ` - ${stepLabels[currentStep]}`}
        </span>
        <motion.span
          key={encouragement}
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[#0D9488] font-medium"
        >
          {encouragement}
        </motion.span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ============================================================
// 3b. DEMARCHES - Celebration soumission
// ============================================================

interface SubmissionCelebrationProps {
  show: boolean;
  title?: string;
  subtitle?: string;
}

export function SubmissionCelebration({
  show,
  title = "Dossier envoye !",
  subtitle = "On prend le relais. Vous serez notifie des que ca avance.",
}: SubmissionCelebrationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 250 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-[#0D9488] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/25"
            >
              <CheckCircle className="w-9 h-9 text-white" />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-xl font-bold text-gray-900"
            >
              {title}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-muted-foreground mt-2"
            >
              {subtitle}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// 3c. DEMARCHES - Statuts humains
// ============================================================

const STATUS_CONFIG: Record<string, { label: string; description: string; color: string }> = {
  en_saisie: {
    label: "En cours de saisie",
    description: "Prenez votre temps, on ne bouge pas.",
    color: "text-gray-500",
  },
  en_attente: {
    label: "On s'en occupe !",
    description: "Votre dossier est entre de bonnes mains.",
    color: "text-[#EAB308]",
  },
  paye: {
    label: "Paiement recu",
    description: "Merci ! On lance le traitement.",
    color: "text-blue-500",
  },
  valide: {
    label: "Valide",
    description: "Tout est conforme, on finalise.",
    color: "text-[#0D9488]",
  },
  finalise: {
    label: "Termine !",
    description: "Votre document est pret.",
    color: "text-green-600",
  },
  refuse: {
    label: "A corriger",
    description: "Un petit ajustement et c'est bon.",
    color: "text-red-500",
  },
};

interface HumanStatusProps {
  status: string;
  showDescription?: boolean;
}

export function HumanStatus({ status, showDescription = false }: HumanStatusProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    description: "",
    color: "text-gray-500",
  };

  return (
    <div>
      <span className={`font-medium text-sm ${config.color}`}>{config.label}</span>
      {showDescription && config.description && (
        <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
      )}
    </div>
  );
}

// ============================================================
// 4. PAIEMENT - Animation confirmation
// ============================================================

interface PaymentSuccessProps {
  amount?: string;
  onContinue?: () => void;
}

export function PaymentSuccessAnimation({ amount, onContinue }: PaymentSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-6 py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
        >
          <CheckCircle className="w-11 h-11 text-white" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <h2 className="text-2xl font-bold text-gray-900">Paiement confirme !</h2>
        {amount && <p className="text-lg text-muted-foreground">{amount}</p>}
        <p className="text-sm text-muted-foreground">
          Merci pour votre confiance. On s'occupe de la suite.
        </p>
      </motion.div>

      {onContinue && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="px-6 py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white text-sm font-medium rounded-lg shadow-md"
        >
          Voir mon dossier
        </motion.button>
      )}
    </motion.div>
  );
}

// ============================================================
// 5. MICRO-INTERACTIONS - Carte avec hover
// ============================================================

interface WhimsyCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function WhimsyCard({ children, className = "", onClick }: WhimsyCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 12px 30px -8px rgba(30, 58, 138, 0.12)" }}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`bg-white rounded-xl border p-5 transition-colors ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// 5b. MICRO-INTERACTIONS - Page transition wrapper
// ============================================================

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// 5c. MICRO-INTERACTIONS - Loading state avec message
// ============================================================

const LOADING_MESSAGES = [
  "Preparation de votre espace...",
  "On rassemble tout ca...",
  "Encore un instant...",
  "Chargement en cours...",
];

interface WhimsyLoaderProps {
  message?: string;
}

export function WhimsyLoader({ message }: WhimsyLoaderProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const displayMessage = message || LOADING_MESSAGES[msgIndex];

  useEffect(() => {
    if (message) return;
    const t = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(t);
  }, [message]);

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-8 h-8 text-[#1E3A8A]/60" />
      </motion.div>
      <motion.p
        key={displayMessage}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-muted-foreground"
      >
        {displayMessage}
      </motion.p>
    </div>
  );
}

// ============================================================
// 5d. MICRO-INTERACTIONS - Toast avec personnalite
// ============================================================

// Note: a utiliser avec le hook useToast de shadcn existant.
// Exemples de messages a passer au toast :

export const WHIMSY_TOASTS = {
  demarcheSaved: {
    title: "Brouillon sauvegarde",
    description: "Votre travail est en securite. Reprenez quand vous voulez.",
  },
  documentUploaded: {
    title: "Document recu",
    description: "Bien recu ! Un de moins a envoyer.",
  },
  profileUpdated: {
    title: "Profil mis a jour",
    description: "C'est note !",
  },
  copySuccess: {
    title: "Copie !",
    description: "Dans votre presse-papiers, pret a coller.",
  },
  networkError: {
    title: "Connexion instable",
    description: "Reessayez dans quelques secondes, ca devrait revenir.",
    variant: "destructive" as const,
  },
} as const;

// ============================================================
// 5e. MICRO-INTERACTIONS - Skeleton avec shimmer
// ============================================================

export function WhimsySkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-muted ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
