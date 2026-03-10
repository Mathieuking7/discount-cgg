import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { siteConfig } from "@/config/site.config";

const RechercheSuivi = () => {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/suivi/${trackingNumber.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEOHead
        title={`Suivi de Commande | ${siteConfig.siteName}`}
        description="Suivez l'avancement de votre demarche de carte grise en temps reel."
        canonicalUrl={`${siteConfig.baseUrl}/recherche-suivi`}
      />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1B2A4A] mb-2">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A]">
              Suivre ma commande
            </h1>
            <p className="text-gray-500 text-sm">
              Entrez votre numero de suivi pour consulter l'etat de votre dossier.
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="tracking" className="sr-only">Numero de suivi</label>
              <input
                id="tracking"
                type="text"
                placeholder="TRK-2025-000007"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full h-14 px-5 text-lg bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30 focus:border-[#1B2A4A] transition-all placeholder:text-gray-400 font-mono"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!trackingNumber.trim()}
              className="w-full h-14 bg-[#1B2A4A] hover:bg-[#263a5e] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              Rechercher
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Help */}
          <p className="text-center text-sm text-gray-400">
            Numero introuvable ? Verifiez vos emails ou contactez{" "}
            <a href={`mailto:${siteConfig.emails.support}`} className="text-[#1B2A4A] hover:underline font-medium">
              {siteConfig.emails.support}
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <p className="text-xs text-gray-400">{siteConfig.siteName}</p>
      </div>
    </div>
  );
};

export default RechercheSuivi;
