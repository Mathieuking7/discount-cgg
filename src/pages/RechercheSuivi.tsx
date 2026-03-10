import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, Mail, HelpCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
    <div className="min-h-screen bg-[#FDF8F0]">
      <SEOHead
        title={`Suivi de Commande Carte Grise | Suivre Mon Dossier - ${siteConfig.siteName}`}
        description="Suivez l'avancement de votre demarche de carte grise en temps reel. Entrez votre numero de suivi pour consulter l'etat de votre dossier."
        canonicalUrl={`${siteConfig.baseUrl}/recherche-suivi`}
      />
      <Navbar />

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-2">
              <Package className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Suivre ma commande
            </h1>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              Entrez votre numero de suivi pour consulter l'etat de votre carte grise
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="tracking" className="text-sm font-semibold text-gray-700">
                  Numero de suivi
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="tracking"
                    type="text"
                    placeholder="Ex: TRK-2025-000007"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full pl-12 pr-4 h-14 text-lg bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all placeholder:text-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Format: TRK-XXXX-XXXXXX
                </p>
              </div>
              <button
                type="submit"
                disabled={!trackingNumber.trim()}
                className="w-full h-14 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-lg rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
              >
                <Search className="w-5 h-5" />
                Rechercher ma commande
              </button>
            </form>

            {/* Help section */}
            <div className="mt-8 p-5 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1.5">Vous ne trouvez pas votre numero ?</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Verifiez votre boite email (et les spams) pour retrouver l'email de confirmation
                    contenant votre numero de suivi.
                  </p>
                  <p className="text-sm text-gray-600">
                    Pour toute question, contactez-nous a{" "}
                    <a href={`mailto:${siteConfig.emails.support}`} className="text-amber-600 hover:underline font-medium">
                      {siteConfig.emails.support}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RechercheSuivi;
