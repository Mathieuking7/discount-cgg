import { Menu, X, LogIn } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/config/site.config";

const navLinks = [
  { href: "#fonctionnement", label: "Comment ca marche" },
  { href: "#features", label: "Avantages" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#avis", label: "Avis" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-[#1B2A4A] focus:rounded focus:shadow-lg focus:font-semibold">
        Aller au contenu principal
      </a>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5"
        >
          <span className="font-serif font-bold text-xl text-[#002395] tracking-tight">
            {siteConfig.siteName}
          </span>
        </button>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-widest font-sans text-[#1A1A1A] hover:text-[#002395] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => navigate("/recherche-suivi")}
            className="text-xs uppercase tracking-widest font-sans text-[#1A1A1A] hover:text-[#002395] transition-colors"
          >
            Suivi
          </button>
          <button
            onClick={() => navigate("/login")}
            className="text-xs uppercase tracking-widest font-sans bg-[#002395] text-white px-5 py-2.5 hover:bg-[#002395]/90 transition-colors flex items-center gap-2"
          >
            <LogIn size={13} />
            Espace Pro
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-[#1A1A1A]"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-gray-200 bg-white"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="py-2.5 text-xs uppercase tracking-widest font-sans text-[#1A1A1A] hover:text-[#002395] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-gray-200 my-2" />
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/recherche-suivi");
                }}
                className="py-2.5 text-xs uppercase tracking-widest font-sans text-[#1A1A1A] hover:text-[#002395] transition-colors text-left"
              >
                Suivi de commande
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/login");
                }}
                className="mt-2 text-xs uppercase tracking-widest font-sans bg-[#002395] text-white text-center py-3 flex items-center justify-center gap-2 hover:bg-[#002395]/90 transition-colors"
              >
                <LogIn size={13} />
                Espace Pro
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
