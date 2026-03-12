import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SIVFlowNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Fonctionnalites", href: "#features" },
    { label: "Tarifs", href: "#pricing" },
    { label: "Temoignages", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white font-bold text-sm">
              SF
            </div>
            <span className="text-xl font-bold text-[#1C1917]">King Carte Grise</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#78716C] hover:text-[#1C1917] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="text-sm text-[#1C1917]">
              Se connecter
            </Button>
            <Button className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white text-sm hover:opacity-90">
              Reserver une demo
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-sm font-medium text-[#78716C]"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 space-y-2 border-t border-gray-100">
                <Button variant="outline" className="w-full text-sm">
                  Se connecter
                </Button>
                <Button className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white text-sm">
                  Reserver une demo
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default SIVFlowNavbar;
