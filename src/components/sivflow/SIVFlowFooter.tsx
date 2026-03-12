import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";

const SIVFlowFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1C1917] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-xs font-bold">
                SF
              </div>
              <span className="text-lg font-bold">King Carte Grise propulse par Sivflow.fr</span>
            </div>
            <p className="text-sm text-white/60 mb-4">
              La plateforme SIV pour les pros de l'automobile.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Reseau social"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Produit */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Produit</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalites</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">Temoignages</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Ressources</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">Mentions legales</a></li>
              <li><a href="#" className="hover:text-white transition-colors">CGV</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialite</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            &copy; {year} King Carte Grise propulse par Sivflow.fr. Tous droits reserves.
          </p>
          <p className="text-xs text-white/40">
            Paiement securise · Traitement sous 24h · Satisfaction garantie
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SIVFlowFooter;
