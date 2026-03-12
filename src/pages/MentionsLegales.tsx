import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/config/site.config";

const MentionsLegales = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-serif font-bold text-[#1B2A4A] mb-10">
          Mentions legales
        </h1>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            1. Editeur du site
          </h2>
          <ul className="space-y-1 text-gray-700 leading-relaxed">
            <li><strong>Raison sociale :</strong> {siteConfig.legalName}</li>
            <li><strong>Forme juridique :</strong> SAS au capital de [CAPITAL] euros</li>
            <li><strong>SIRET :</strong> [SIRET]</li>
            <li><strong>Siege social :</strong> [ADRESSE COMPLETE]</li>
            <li><strong>Numero de telephone :</strong> [TELEPHONE]</li>
            <li><strong>Adresse e-mail :</strong> {siteConfig.emails.contact}</li>
            <li><strong>Site internet :</strong> {siteConfig.baseUrl}</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            2. Directeur de la publication
          </h2>
          <p className="text-gray-700">
            Le directeur de la publication est [NOM DU DIRIGEANT], en qualite de
            President de {siteConfig.legalName}.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            3. Hebergeur
          </h2>
          <ul className="space-y-1 text-gray-700 leading-relaxed">
            <li><strong>Hebergement application :</strong> Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
            <li><strong>Hebergement donnees :</strong> Supabase Inc. — 970 Toa Payoh North #07-04, Singapore 318992</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            4. Securite et protection des donnees
          </h2>
          <p className="text-gray-700">
            {siteConfig.legalName} assure la protection de vos donnees personnelles
            et documents conformement au RGPD. Toutes les transmissions sont
            chiffrees en SSL 256 bits. Vos documents sont supprimes automatiquement
            apres le traitement de votre dossier.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            5. Propriete intellectuelle
          </h2>
          <p className="text-gray-700 leading-relaxed">
            L'ensemble des contenus (textes, images, logo, graphismes) presents
            sur le site {siteConfig.baseUrl} sont proteges par le droit de la
            propriete intellectuelle et sont la propriete exclusive de{" "}
            {siteConfig.legalName}. Toute reproduction, meme partielle, est
            interdite sans autorisation prealable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            6. Contact
          </h2>
          <p className="text-gray-700">
            Pour toute question relative aux presentes mentions legales, vous
            pouvez nous contacter a l'adresse :{" "}
            <a
              href={`mailto:${siteConfig.emails.contact}`}
              className="text-blue-600 hover:underline"
            >
              {siteConfig.emails.contact}
            </a>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MentionsLegales;
