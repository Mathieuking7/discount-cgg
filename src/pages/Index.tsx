import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Process from "@/components/Process";
import WhyUs from "@/components/WhyUs";
import FAQ from "@/components/FAQ";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import Services from "@/components/Services";
import { GoogleReviewsCarousel } from "@/components/GoogleReviewsCarousel";
import { SimulateurSection } from "@/components/SimulateurSection";
import { TrustSection } from "@/components/TrustSection";
import SEOHead from "@/components/SEOHead";
import SchemaOrg, {
  sivflowSoftwareSchema,
  sivflowOrganizationSchema,
  sivflowFAQSchema,
} from "@/components/SchemaOrg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="SIVFlow - Logiciel Carte Grise Pro | Démarches SIV en Ligne pour Garages"
        description="Plateforme SIV pour professionnels automobile. Carte grise, déclaration d'achat et de cession en quelques clics. Traitement 24h. Tarifs négociant dès 10€."
        canonicalUrl="https://sivflow.fr/"
      />
      <SchemaOrg
        schema={[
          sivflowSoftwareSchema,
          sivflowOrganizationSchema,
          sivflowFAQSchema,
        ]}
      />
      <Navbar />
      <Hero />
      <SimulateurSection />
      <Services />
      <TrustSection />
      <GoogleReviewsCarousel />
      <Process />
      <WhyUs />
      <FAQ />
      <ContactForm />
      <Footer />
    </div>
  );
};

export default Index;
