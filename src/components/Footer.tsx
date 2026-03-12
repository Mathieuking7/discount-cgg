import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { siteConfig } from "@/config/site.config";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const linkClass =
    "text-sm text-white/80 hover:text-white transition-colors";
  const headingClass =
    "text-xs uppercase tracking-widest font-sans text-white/70 mb-4";

  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-0">
          {/* Brand */}
          <div className="md:pr-8 space-y-4">
            <span className="font-serif font-bold text-xl text-white tracking-tight">
              {siteConfig.siteName}
            </span>
            <p className="text-sm text-white/80 leading-relaxed">
              Vos demarches d'immatriculation simplifiees. Service rapide,
              professionnel et 100% securise.
            </p>
            <div className="flex space-x-3 pt-1">
              {siteConfig.social.facebook && (
                <a
                  href={siteConfig.social.facebook}
                  aria-label="Facebook"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <Facebook className="w-4 h-4" aria-hidden="true" />
                </a>
              )}
              {siteConfig.social.instagram && (
                <a
                  href={siteConfig.social.instagram}
                  aria-label="Instagram"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <Instagram className="w-4 h-4" aria-hidden="true" />
                </a>
              )}
              {siteConfig.social.linkedin && (
                <a
                  href={siteConfig.social.linkedin}
                  aria-label="LinkedIn"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <Linkedin className="w-4 h-4" aria-hidden="true" />
                </a>
              )}
              <a
                href={`mailto:${siteConfig.emails.contact}`}
                aria-label="Email"
                className="text-white/70 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="md:px-8 md:border-l md:border-white/10">
            <h4 className={headingClass}>Services</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className={linkClass}>
                  Carte grise
                </a>
              </li>
              <li>
                <a href="#" className={linkClass}>
                  Declaration de cession
                </a>
              </li>
              <li>
                <a href="#" className={linkClass}>
                  Changement d'adresse
                </a>
              </li>
              <li>
                <a href="#" className={linkClass}>
                  Duplicata
                </a>
              </li>
            </ul>
          </div>

          {/* Informations */}
          <div className="md:px-8 md:border-l md:border-white/10">
            <h4 className={headingClass}>Informations</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#fonctionnement" className={linkClass}>
                  Comment ca marche
                </a>
              </li>
              <li>
                <a href="#tarifs" className={linkClass}>
                  Tarifs
                </a>
              </li>
              <li>
                <a href="#faq" className={linkClass}>
                  FAQ
                </a>
              </li>
              <li>
                <button
                  onClick={() => navigate("/login")}
                  className={linkClass}
                >
                  Espace Pro
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:px-8 md:border-l md:border-white/10">
            <h4 className={headingClass}>Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => navigate("/mentions-legales")}
                  className={linkClass}
                >
                  Mentions legales
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/cgv")}
                  className={linkClass}
                >
                  CGV
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/politique-confidentialite")}
                  className={linkClass}
                >
                  Politique de confidentialite
                </button>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.emails.contact}`}
                  className={linkClass}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <p>
            &copy; {currentYear} {siteConfig.siteName}. Tous droits reserves.
          </p>
          <p>Service agree et conforme ANTS</p>
        </div>
      </div>

      {/* Tricolor bar */}
      <div className="h-1.5 flex">
        <div className="flex-1 bg-[#002395]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#ED2939]" />
      </div>
    </footer>
  );
};

export default Footer;
