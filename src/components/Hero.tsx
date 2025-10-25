import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Service professionnel de carte grise"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/90 to-primary/70"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Vos formalités <span className="text-accent">carte grise</span> simplifiées
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            Service professionnel, rapide et 100% en ligne. Déclarations et cartes grises traitées en moins de 24h.
          </p>

          {/* Price Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
              <CheckCircle2 className="w-6 h-6 text-accent mb-2" />
              <h3 className="text-white font-semibold mb-1">Déclaration d'achat</h3>
              <p className="text-3xl font-bold text-white">10€</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
              <CheckCircle2 className="w-6 h-6 text-accent mb-2" />
              <h3 className="text-white font-semibold mb-1">Déclaration de cession</h3>
              <p className="text-3xl font-bold text-white">10€</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
              <CheckCircle2 className="w-6 h-6 text-accent mb-2" />
              <h3 className="text-white font-semibold mb-1">Carte grise</h3>
              <p className="text-3xl font-bold text-white">30€ <span className="text-lg font-normal">+ prix CG</span></p>
            </div>
          </div>

          <Button variant="hero" size="lg" className="text-lg px-8 py-6" onClick={scrollToContact}>
            Commencer maintenant
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>

      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg className="w-full h-16 md:h-24" viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 74L60 68.3C120 62.7 240 51.3 360 45.7C480 40 600 40 720 45.7C840 51.3 960 62.7 1080 62.7C1200 62.7 1320 51.3 1380 45.7L1440 40V74H1380C1320 74 1200 74 1080 74C960 74 840 74 720 74C600 74 480 74 360 74C240 74 120 74 60 74H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
