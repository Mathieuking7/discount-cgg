import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseErrorMessage } from "@/lib/error-messages";
import { siteConfig } from "@/config/site.config";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir votre adresse email.",
        variant: "destructive"
      });
      return;
    }

    if (!password) {
      toast({
        title: "Mot de passe requis",
        description: "Veuillez saisir votre mot de passe.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Erreur de connexion",
        description: getSupabaseErrorMessage(error),
        variant: "destructive"
      });
    } else {
      toast({
        title: "Connexion réussie",
        description: "Redirection vers votre espace..."
      });
      navigate("/dashboard");
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Erreur de connexion Google",
        description: getSupabaseErrorMessage(error),
        variant: "destructive"
      });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel - Branding */}
      <div className="lg:w-1/2 bg-[#002395] text-white p-8 lg:p-16 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto lg:mx-0"
        >
          <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-6">
            {siteConfig.siteName}
          </h1>
          <p className="text-white/70 text-lg mb-10">
            Votre espace professionnel pour les démarches automobiles.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white/40" />
              <span className="text-white/80 text-sm">Démarches simplifiées et rapides</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white/40" />
              <span className="text-white/80 text-sm">Suivi en temps réel de vos dossiers</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white/40" />
              <span className="text-white/80 text-sm">Support dédié aux professionnels</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right panel - Form */}
      <div className="lg:w-1/2 bg-white flex items-center justify-center p-8 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Tricolor accent bar */}
          <div className="flex h-1 mb-8">
            <div className="flex-1 bg-[#002395]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#ED2939]" />
          </div>

          <h2 className="font-serif text-3xl font-bold text-[#1A1A1A] mb-1">
            Se connecter
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Accédez à votre espace professionnel
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email professionnel
              </label>
              <input
                id="email"
                type="email"
                placeholder="garage@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-4 text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#002395] focus:border-transparent transition"
                style={{ minHeight: 48 }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <button
                  type="button"
                  className="text-xs text-[#002395] hover:text-[#001a6e] font-medium"
                  onClick={() => navigate("/forgot-password")}
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-4 text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#002395] focus:border-transparent transition"
                style={{ minHeight: 48 }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full rounded-md bg-[#002395] text-white font-semibold hover:bg-[#001a6e] disabled:opacity-50 disabled:cursor-not-allowed transition"
              style={{ minHeight: 48 }}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            {/* Google auth hidden for now - enable via siteConfig.features.googleAuth */}
          </form>

          {/* Footer link */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-[#002395] font-semibold hover:text-[#001a6e]">
              S'inscrire
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
