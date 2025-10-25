import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center font-bold text-white text-xl">
                J2
              </div>
              <span className="text-xl font-bold">Jimmy 2x</span>
            </div>
            <p className="text-sm">
              Vos démarches d'immatriculation simplifiées. Service rapide, professionnel et 100% sécurisé.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-accent transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#services" className="hover:text-accent transition-colors">Déclaration d'achat</a></li>
              <li><a href="#services" className="hover:text-accent transition-colors">Déclaration de cession</a></li>
              <li><a href="#services" className="hover:text-accent transition-colors">Carte grise</a></li>
              <li><a href="#tarifs" className="hover:text-accent transition-colors">Tarifs</a></li>
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h4 className="font-bold mb-4">Informations</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#process" className="hover:text-accent transition-colors">Comment ça marche</a></li>
              <li><a href="#faq" className="hover:text-accent transition-colors">FAQ</a></li>
              <li><a href="#contact" className="hover:text-accent transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Espace Pro</a></li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="font-bold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-accent transition-colors">Mentions légales</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Conditions générales</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm">
              © {currentYear} Jimmy 2x. Tous droits réservés.
            </p>
            <p className="text-sm">
              Service agréé et conforme ANTS
            </p>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <a
        href="#contact"
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-accent to-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
        aria-label="Chat avec nous"
      >
        <Mail className="w-6 h-6 text-white" />
      </a>
    </footer>
  );
};

export default Footer;
