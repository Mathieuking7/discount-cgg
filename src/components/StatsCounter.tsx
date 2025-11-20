import { useEffect, useState } from "react";
import { CheckCircle2, TrendingUp } from "lucide-react";
export const StatsCounter = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // Calculer le nombre de cartes grises depuis 2017
    const startDate = new Date(2017, 0, 1);
    const today = new Date();
    const daysSince2017 = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Base: 45 cartes grises par jour en moyenne
    const baseCount = daysSince2017 * 45;

    // Ajouter un nombre aléatoire pour le jour actuel (0-50)
    const todayProgress = Math.floor(Math.random() * 50);
    const finalCount = baseCount + todayProgress;

    // Animation du compteur
    let current = 0;
    const increment = Math.ceil(finalCount / 50);
    const timer = setInterval(() => {
      current += increment;
      if (current >= finalCount) {
        setCount(finalCount);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 30);
    return () => clearInterval(timer);
  }, []);
  return <div className="relative overflow-hidden bg-gradient-to-br from-success via-success to-success/80 text-success-foreground rounded-2xl p-10 shadow-2xl border-2 border-success/30">
      {/* Motif de fond */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }} />
      </div>
      
      <div className="relative z-10 text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <CheckCircle2 className="w-16 h-16 animate-pulse" />
          <TrendingUp className="w-12 h-12" />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-widest opacity-90">
            Depuis 2017
          </p>
          <p className="text-6xl md:text-7xl font-black tabular-nums drop-shadow-lg">
            {count.toLocaleString('fr-FR')}
          </p>
          <div className="h-1 w-48 bg-success-foreground/30 mx-auto rounded-full" />
          <p className="text-2xl font-bold mt-4">
            Démarches Réalisées
          </p>
        </div>
        
        <div className="pt-6 mt-6 border-t border-success-foreground/20">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">⭐</span>
            <p className="text-lg font-bold">
              Service de Confiance Certifié
            </p>
            <span className="text-3xl">⭐</span>
          </div>
        </div>
      </div>
    </div>;
};