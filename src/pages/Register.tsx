import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { getSupabaseErrorMessage } from "@/lib/error-messages";
import { siteConfig } from "@/config/site.config";
import { motion } from "framer-motion";

export default function Register() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    raisonSociale: "",
    reseau: "",
    siret: "",
    email: "",
    telephone: "",
    adresse: "",
    codePostal: "",
    ville: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(formData.email, formData.password, {
      raison_sociale: formData.raisonSociale,
      reseau: formData.reseau || null,
      siret: formData.siret,
      adresse: formData.adresse,
      code_postal: formData.codePostal,
      ville: formData.ville,
      email: formData.email,
      telephone: formData.telephone
    });

    if (error) {
      toast({
        title: "Erreur d'inscription",
        description: getSupabaseErrorMessage(error),
        variant: "destructive"
      });
    } else {
      toast({
        title: "Compte créé avec succès",
        description: "Redirection vers votre espace..."
      });
      navigate("/dashboard");
    }

    setLoading(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGoogleSignup = async () => {
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

  const inputClass =
    "w-full rounded-md border border-gray-300 px-4 text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#002395] focus:border-transparent transition";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel - Branding */}
      <div className="lg:w-5/12 bg-[#002395] text-white p-8 lg:p-16 flex flex-col justify-center lg:sticky lg:top-0 lg:h-screen">
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
            Créez votre compte professionnel en quelques minutes.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white/40" />
              <span className="text-white/80 text-sm">Inscription gratuite et sans engagement</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white/40" />
              <span className="text-white/80 text-sm">Première démarche offerte</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white/40" />
              <span className="text-white/80 text-sm">Accompagnement personnalisé</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right panel - Form */}
      <div className="lg:w-7/12 bg-white py-12 px-8 lg:px-16 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-2xl"
        >
          {/* Tricolor accent bar */}
          <div className="flex h-1 mb-8">
            <div className="flex-1 bg-[#002395]" />
            <div className="flex-1 bg-white border-t border-gray-200" />
            <div className="flex-1 bg-[#ED2939]" />
          </div>

          <h2 className="font-serif text-3xl font-bold text-[#1A1A1A] mb-1">
            Créer un compte professionnel
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Rejoignez {siteConfig.siteName} et simplifiez vos démarches
          </p>

          {/* Google signup */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading || googleLoading}
            className="w-full rounded-md border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition mb-6"
            style={{ minHeight: 48 }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {googleLoading ? "Connexion..." : "S'inscrire avec Google"}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400">ou avec email</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-8">
            {/* Entreprise */}
            <div className="space-y-4">
              <h3 className="uppercase tracking-widest text-xs text-gray-500 font-medium pb-2 border-b border-gray-200">
                Informations de l'entreprise
              </h3>

              <div>
                <label htmlFor="raisonSociale" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Raison sociale *
                </label>
                <input
                  id="raisonSociale"
                  placeholder="Garage Martin SARL"
                  value={formData.raisonSociale}
                  onChange={(e) => handleChange("raisonSociale", e.target.value)}
                  required
                  className={inputClass}
                  style={{ minHeight: 48 }}
                />
              </div>

              <div>
                <label htmlFor="reseau" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Réseau
                </label>
                <input
                  id="reseau"
                  placeholder="Nom du réseau (optionnel)"
                  value={formData.reseau}
                  onChange={(e) => handleChange("reseau", e.target.value)}
                  className={inputClass}
                  style={{ minHeight: 48 }}
                />
              </div>

              <div>
                <label htmlFor="siret" className="block text-sm font-medium text-gray-700 mb-1.5">
                  SIRET * (14 chiffres)
                </label>
                <input
                  id="siret"
                  placeholder="12345678900012"
                  value={formData.siret}
                  onChange={(e) => handleChange("siret", e.target.value.replace(/\D/g, '').slice(0, 14))}
                  maxLength={14}
                  required
                  className={inputClass}
                  style={{ minHeight: 48 }}
                />
              </div>

              <div>
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresse *
                </label>
                <input
                  id="adresse"
                  placeholder="15 rue de la République"
                  value={formData.adresse}
                  onChange={(e) => handleChange("adresse", e.target.value)}
                  required
                  className={inputClass}
                  style={{ minHeight: 48 }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="codePostal" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Code postal *
                  </label>
                  <input
                    id="codePostal"
                    placeholder="75001"
                    value={formData.codePostal}
                    onChange={(e) => handleChange("codePostal", e.target.value)}
                    required
                    className={inputClass}
                    style={{ minHeight: 48 }}
                  />
                </div>
                <div>
                  <label htmlFor="ville" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ville *
                  </label>
                  <input
                    id="ville"
                    placeholder="Paris"
                    value={formData.ville}
                    onChange={(e) => handleChange("ville", e.target.value)}
                    required
                    className={inputClass}
                    style={{ minHeight: 48 }}
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="uppercase tracking-widest text-xs text-gray-500 font-medium pb-2 border-b border-gray-200">
                Coordonnées de contact
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email professionnel *
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="contact@garage-martin.fr"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    className={inputClass}
                    style={{ minHeight: 48 }}
                  />
                </div>
                <div>
                  <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Téléphone *
                  </label>
                  <input
                    id="telephone"
                    type="tel"
                    placeholder="01 23 45 67 89"
                    value={formData.telephone}
                    onChange={(e) => handleChange("telephone", e.target.value)}
                    required
                    className={inputClass}
                    style={{ minHeight: 48 }}
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-4">
              <h3 className="uppercase tracking-widest text-xs text-gray-500 font-medium pb-2 border-b border-gray-200">
                Sécurité
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mot de passe *
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                    className={inputClass}
                    style={{ minHeight: 48 }}
                  />
                  <PasswordStrengthIndicator password={formData.password} />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    required
                    className={inputClass}
                    style={{ minHeight: 48 }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full rounded-md bg-[#002395] text-white font-semibold hover:bg-[#001a6e] disabled:opacity-50 disabled:cursor-not-allowed transition"
              style={{ minHeight: 48 }}
            >
              {loading ? "Création du compte..." : "Créer mon compte professionnel"}
            </button>
          </form>

          {/* Footer link */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-[#002395] font-semibold hover:text-[#001a6e]">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
