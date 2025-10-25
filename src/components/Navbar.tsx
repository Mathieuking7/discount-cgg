import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center font-bold text-white text-xl">
              J2
            </div>
            <span className="text-xl font-bold text-foreground">Jimmy 2x</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection("services")} className="text-foreground hover:text-primary transition-colors">
              Services
            </button>
            <button onClick={() => scrollToSection("process")} className="text-foreground hover:text-primary transition-colors">
              Processus
            </button>
            <button onClick={() => scrollToSection("tarifs")} className="text-foreground hover:text-primary transition-colors">
              Tarifs
            </button>
            <button onClick={() => scrollToSection("faq")} className="text-foreground hover:text-primary transition-colors">
              FAQ
            </button>
            <Button variant="hero" size="lg" onClick={() => scrollToSection("contact")}>
              Commencer
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-foreground hover:text-primary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <button onClick={() => scrollToSection("services")} className="block w-full text-left text-foreground hover:text-primary transition-colors py-2">
              Services
            </button>
            <button onClick={() => scrollToSection("process")} className="block w-full text-left text-foreground hover:text-primary transition-colors py-2">
              Processus
            </button>
            <button onClick={() => scrollToSection("tarifs")} className="block w-full text-left text-foreground hover:text-primary transition-colors py-2">
              Tarifs
            </button>
            <button onClick={() => scrollToSection("faq")} className="block w-full text-left text-foreground hover:text-primary transition-colors py-2">
              FAQ
            </button>
            <Button variant="hero" size="lg" className="w-full" onClick={() => scrollToSection("contact")}>
              Commencer
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
