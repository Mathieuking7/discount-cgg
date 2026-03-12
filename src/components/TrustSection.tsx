import { Shield, CreditCard, CheckCircle, Lock, ShieldCheck } from "lucide-react";

export const TrustSection = () => {
  return (
    <section className="py-16 px-4 bg-primary text-primary-foreground">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Paiement sécurisé */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Paiement sécurisé
            </h3>
            <div className="flex flex-wrap items-center gap-3 bg-primary-foreground/10 p-4 rounded-xl border border-primary-foreground/20">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" 
                alt="Visa" 
                className="h-7 object-contain bg-white rounded px-2 py-1"
              />
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                alt="Mastercard" 
                className="h-7 object-contain"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" 
                alt="Google Pay" 
                className="h-7 object-contain bg-white rounded px-2 py-1"
              />
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" 
                alt="Apple Pay" 
                className="h-7 object-contain bg-white rounded px-2 py-1"
              />
            </div>
            
            {/* Sécurité des documents */}
            <div className="bg-primary-foreground/10 p-4 rounded-xl border border-primary-foreground/20">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm mb-1">Vos documents sont protégés</p>
                  <p className="text-xs opacity-90">
                    Tous vos documents sont cryptés (SSL 256 bits) et automatiquement supprimés après le traitement de votre dossier. Votre vie privée est notre priorité.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Badge RGPD */}
            <div className="flex items-center gap-3 bg-primary-foreground/10 p-3 rounded-xl border border-primary-foreground/20">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-foreground/20 rounded-full flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Conforme RGPD</p>
                <p className="text-xs opacity-80">Protection des données personnelles</p>
              </div>
            </div>
          </div>

          {/* Garanties client */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Nos engagements
            </h3>
            <div className="bg-primary-foreground/10 p-4 rounded-xl border border-primary-foreground/20 space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Traitement rapide sous 24h</p>
                  <p className="text-xs opacity-80">Votre dossier traité en moins d'un jour ouvré</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Satisfaction garantie</p>
                  <p className="text-xs opacity-80">+10 000 clients satisfaits · Note 4.8/5</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Support disponible 7j/7</p>
                  <p className="text-xs opacity-80">Une vraie personne vous répond, pas un robot</p>
                </div>
              </div>

              {/* Bande tricolore */}
              <div className="h-1 w-full bg-gradient-to-r from-france-blue via-background to-france-red rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
